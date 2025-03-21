import { COLORS } from "./theme";
import { getCurrentCuatri, promediar } from "./utils";

const FONT_AFUERA = ["CBC", "*CBC"];
const ALWAYS_SHOW = [
  "Materias Obligatorias",
  "CBC",
  "Fin de Carrera (Obligatorio)",
];

function breakWords(string) {
  let broken = "";
  string.split(" ").forEach((element) => {
    if (element.length < 4) broken += " " + element;
    else broken += "\n" + element;
  });
  return broken.trim();
}

class Node {
  // Los nodos los creamos en base a lo que hay en los json, y arrancan todos desaprobados
  // Hay varios atributos propios ('categoria', 'cuatrimestre') => Probablemente todos los que estan en español
  // Hay atributos de visjs que determinan muchas cosas del network => Probablemente todos los que estan en ingles
  constructor(n) {
    // Guardamos una referencia al nodo mismo para poder manipularlo desde afuera
    // (porque cuando llenamos el grafo, visjs hace lo que quiere con nuestra estructura de datos)
    this.nodeRef = this;

    // Si en los jsons hay un campo valido de visjs, lo vamos a tomar
    // Por ejemplo, el campo level lo levantamos directo desde el json
    Object.assign(this, { ...n });
    this.label = breakWords(n.materia);

    // El group de visjs determina los colores y miles de cosas mas
    // La categoria es FIUBA: cbc, electiva, obligatoria, etc
    // El grupo es visjs: "habilitada", "aprobada", etc
    // Las categorias son:
    // - *CBC: Las materias del CBC
    // - CBC: El nodo que abre/cierra el CBC. Tecnicamente, no es una materia
    // - Materias Obligatorias: Las materias obligatorias de la carrera
    // - Materias Electivas: Las materias electivas de la carrera
    // - <Orientaciones>: Distintas orientaciones de las carreras.
    //   - en algunas carreras son solamente maneras de clasificar las materias electivas
    //   - en otras, son materias que hay que hacer si o si porque tenes que elegir una orientacion para recibirte
    // - Multiples Orientaciones: Materias que se clasifican en varias orientaciones a la vez (solo pasa en electronica)
    // - Fin de Carrera: Tesis/TPP, etc. Hay que si o si elegirlo para recibirte
    // - Fin de Carrera (Obligatorio): Tesis/TPP de las carreras que no te dejan elegir
    this.group = this.categoria;

    // Nota = -2 => desaprobada
    // Nota = -1 => en final
    // Nota = 0 => aprobada por equivalencia
    // Nota = 4-10 => aprobada con nota
    this.nota = -2;

    // Solamente como un shortcut de nota >= 0
    this.aprobada = false;

    // El level de visjs determina en que columna esta cada nodo
    // Con los cuatris podemos "planear" las materias: mostrarlas en la columna que queremos
    // Los cuatris son enteros para los primeros cuatris, y floats para los segundos
    // - 2020 => 2020 primer cuatri.
    // - 2020.5 => 2020 segundo cuatri
    this.cuatrimestre = undefined;
    this.originalLevel = this.level;
    this.level = this.level ?? -3;

    // Arrancan escondidas las materias electivas, las de las orientaciones, etc
    // Siempre mostramos el CBC, las obligatorias, y el final de la carrera de las carreras que no pueden elegir entre tesis y tpp
    this.hidden = !ALWAYS_SHOW.includes(this.categoria);
  }

  aprobar(nota) {
    if (nota < -1) return;
    this.aprobada = nota > -1 ? true : false;
    this.nota = nota;
    return this;
  }

  desaprobar() {
    this.aprobada = false;
    this.nota = -2;
    return this;
  }

  cursando(cuatri) {
    this.cuatrimestre = cuatri;
    return this;
  }

  // Incluye si la materia esta aprobada por equivalencia, o si esta aprobada con nota
  cursadaAprobada() {
    return this.nota >= -1;
  }

  // Incluye si la materia esta aprobada por equivalencia.
  finalAprobado() {
    return this.nota >= 0;
  }

  aprobadaPorEquivalencia() {
    return this.aprobada && this.nota === 0;
  }

  // Una materia esta habilitada cuando todas sus correlativas estan aprobadas
  // Tambien, hay materias que "requieren" un minimo de creditos
  // Si "requiereCBC", entonces se consideran los creditos totales
  // Si no, se consideran los creditos totales menos los creditos del CBC
  // Nota: que se consideren o no los creditos del cbc para esto
  //  es MUY poco claro en todos los planes de fiuba, y todos varian,
  //  asi que puede no ser 100% fiel a la realidad
  isHabilitada(ctx) {

    let materiasNecesariasParaCursar = [];


    if (this["correlativa-cursada"] !== undefined) {
      materiasNecesariasParaCursar = this["correlativa-cursada"].split(" ");
    } else if (this["correlativa-final"] !== undefined) {
      materiasNecesariasParaCursar = this["correlativa-final"].split(" ");
    } else if (this["correlativas"] !== undefined) {
      materiasNecesariasParaCursar = this["correlativas"].split(" ");
    }

    const materiasCursadasNecesariaParaCursar = []
    const materiasFinalNecesarioParaCursar = []

    for (let materia of materiasNecesariasParaCursar) {
      const [tipo, id] = materia.split(":")
      if (id === undefined) {
        //Quiere decir que no hay tipo e Id, sino que es un id solo
        materiasCursadasNecesariaParaCursar.push(tipo)
      } else if (tipo === "TP") {
        materiasCursadasNecesariaParaCursar.push(id)
      } else if (tipo === "F") {
        materiasFinalNecesarioParaCursar.push(id)
      }
    }

    
    const { getters, getNode, creditos } = ctx;
    const { creditosTotales, creditosCBC } = creditos;
    const from = getters.NodesFrom(this.id);
    let estaHabilitadoParaCursar = true;
    for (let id of from) {
      const m = getNode(id);
      //Si no aprobada la cursada, y es necesaria, no esta aprobado
      if (materiasCursadasNecesariaParaCursar.includes(m.id) && !m.cursadaAprobada()) {
        estaHabilitadoParaCursar = false;
        break;
      }

      if (materiasFinalNecesarioParaCursar.includes(m.id) && !m.finalAprobado()) {
        estaHabilitadoParaCursar = false;
        break;
      }
    }
    
    if (this.requiere) {
      if (this.requiereCBC) {
        estaHabilitadoParaCursar &= creditosTotales >= this.requiere;
      } else {
        estaHabilitadoParaCursar &= creditosTotales - creditosCBC >= this.requiere;
      }
    }
    return estaHabilitadoParaCursar;
  }

  // Actualiza el nodo de acuerdo a tooodas sus propiedades
  // Se encarga de cambiarle el grupo (por ejemplo si pasa a estar aprobada, habilitada, etc),
  // las labels (cuando estas logueado muestra la nota), el color de las labels (de acuerdo al color theme)
  // y de ocultar la tesis cuando elegis tpp, y viceversa
  // Esta funcion esta pensada para llamarse a todos los nodos juntos cada vez que cambia algo
  // Porque esta todo tan entrelazado que actualizar solamente un nodo no va a ser fiel a la realidad
  // Por ejemplo: si apruebo X materia y paso los 100 creditos, de alguna forma el nodo que requiere 100 creditos tiene que enterarse
  actualizar(ctx) {
    const { user, showLabels, colorMode, getters } = ctx;

    let grupoDefault = this.categoria;
    if (this.aprobada && this.nota >= 0) grupoDefault = "Aprobadas";
    else if (this.nota === -1) grupoDefault = "En Final";
    else if (this.cuatrimestre === getCurrentCuatri())
      grupoDefault = "Cursando";
    else if (this.isHabilitada(ctx)) grupoDefault = "Habilitadas";
    this.group = grupoDefault;

    let labelDefault = breakWords(this.materia);
    if (showLabels && this.id !== "CBC") {
      if (this.aprobada && this.nota > 0)
        labelDefault += "\n[" + this.nota + "]";
      else if (this.aprobadaPorEquivalencia())
        labelDefault += "\n[Equivalencia]";
      else if (this.cursadaAprobada()) {
        labelDefault += "\n[En Final]"

        //Obtengo todas las aristas conectadas al nodo actual
        const edgesIds = getters.NeighborEdges(this.id);

        //Itero cada arista para elegir cual modificar
        edgesIds.forEach(edgeId => {
          //Obtengo la arista y el nodo al que apunta
          const edge = ctx.network.body.data.edges.get(edgeId);
          const node = ctx.network.body.data.nodes.get(edge.to);


          if (node.id === this.id) {
            //La arista apunta a este nodo, osea viene de un nodo anterior
          } else {
            if (edge.dashes === true) {
              //En caso de que sea una arista punteada (osea requisito de cursada), 
              // Se cambia a color verde (requisito cumplido), porque ya se aprobo la cursada
              ctx.network.body.data.edges.update({ id: edgeId, color: COLORS.aprobadas[400] });
            }
          }
        });
        

      } else if (this.cuatrimestre === getCurrentCuatri())
        labelDefault += "\n[Cursando]";
    }
    this.label = labelDefault;

    // El CBC (y sus materias dentro) usa sus propios colores
    if (this.categoria === "*CBC") {
      if (this.group === "Habilitadas") this.color = COLORS.aprobadas[100];
      if (this.group === "Aprobadas") this.color = COLORS.aprobadas[400];
    }

    if (this.categoria === "CBC") {
      const materiasCBC = getters.MateriasAprobadasCBC();
      const promedioCBC = promediar(materiasCBC);
      if (showLabels && promedioCBC) this.label += "\n[" + promedioCBC + "]";
      if (this.isHabilitada(ctx)) {
        this.color = COLORS.aprobadas[400];
      } else {
        this.color = COLORS.aprobadas[100];
      }
    }

    if (this.categoria === "Fin de Carrera") {
      this.hidden = !(this.id === user.finDeCarrera?.materia);
    }

    if (FONT_AFUERA.includes(this.categoria)) {
      this.font = { color: colorMode === "dark" ? "white" : "black" };
    }

    return this;
  }
}

export default Node;
