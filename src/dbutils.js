import * as C from "./constants";

// Le pega al form de bugs
export const submitBug = async (user, bug) => {
  if (!bug) return;
  const formData = new FormData();
  const padron = user.padron;
  const carreraid = user.carrera.id;
  const orientacionid = user.orientacion?.nombre;
  const findecarreraid = user.finDeCarrera?.id;
  formData.append(`${C.BUGS_FORM_ENTRIES.padron}`, padron);
  formData.append(`${C.BUGS_FORM_ENTRIES.carrera}`, carreraid);
  formData.append(`${C.BUGS_FORM_ENTRIES.orientacion}`, orientacionid || "");
  formData.append(`${C.BUGS_FORM_ENTRIES.finDeCarrera}`, findecarreraid || "");
  formData.append(`${C.BUGS_FORM_ENTRIES.bug}`, bug || "");
  return fetch(`${C.BUGS_FORM}`, {
    body: formData,
    method: "POST",
    mode: "no-cors",
  });
};

// Le pega al form que almacena [padron,carrera,orientacion,findecarrera]
export const postUser = async (user) => {
  const formData = new FormData();
  const padron = user.padron;
  const carreraid = user.carrera.id;
  const orientacionid = user.orientacion?.nombre;
  const findecarreraid = user.finDeCarrera?.id;
  formData.append(`${C.USER_FORM_ENTRIES.padron}`, padron);
  formData.append(`${C.USER_FORM_ENTRIES.carrera}`, carreraid);
  formData.append(`${C.USER_FORM_ENTRIES.orientacion}`, orientacionid || "");
  formData.append(`${C.USER_FORM_ENTRIES.finDeCarrera}`, findecarreraid || "");
  return fetch(`${C.USER_FORM}`, {
    body: formData,
    method: "POST",
    mode: "no-cors",
  });
};

// Le pega al form que almacena [padron,carrera,map]
// el map es un json stringifeado que tiene [materias,optativas,aplazos,checkboxes]
export const postGraph = async (user, map) => {
  const formData = new FormData();
  formData.append(`${C.GRAPH_FORM_ENTRIES.padron}`, user.padron);
  formData.append(`${C.GRAPH_FORM_ENTRIES.carrera}`, user.carrera.id);
  formData.append(`${C.GRAPH_FORM_ENTRIES.map}`, JSON.stringify(map));
  return fetch(`${C.GRAPH_FORM}`, {
    body: formData,
    method: "POST",
    mode: "no-cors",
  });
};

// Consigue todos los mapas asociados a un padron, de todas las carreras
export const getGraphs = async (padron) => {
  const data = await fetch(
    `${C.SPREADSHEET}/${C.SHEETS.registros}!B:D?majorDimension=COLUMNS&key=${C.KEY}`,
  )
    .then((res) => res.json())
    .then((res) => (!res.error ? res.values : null));
  if (!data) return;

  const [padrones, carreras, maps] = data;
  const indexes = [];
  let j = -1;
  while ((j = padrones.indexOf(padron, j + 1)) !== -1) {
    indexes.push(j);
  }

  const allLogins = [];
  for (let i = 0; i < indexes.length; i++) {
    allLogins.push({
      carreraid: carreras[indexes[i]],
      map: maps[indexes[i]],
    });
  }

  return allLogins.map((l) => ({
    carreraid: l.carreraid,
    map: JSON.parse(l.map),
  }));
};
