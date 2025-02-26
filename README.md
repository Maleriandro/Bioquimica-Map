# [Bioquimca Map](https://maleriandro.github.io/Bioquimica-Map/)

Mapa de materias y sus correlativas de la carrera de Bioquimica en la UBA.

---

Este proyecto es un fork del proyecto de [FIUBA Map](https://github.com/FdelMazo/FIUBA-Map/) de FdelMazo.

<a href='https://maleriandro.github.io/Bioquimica-Map/'><img src='preview.png'></a>

- Tiene unicamente la carrera de Bioquimica, en sus ambas versiones.

- Todas las carreras incluyen todas las materias electivas y todas las materias de sus respectivas orientaciones.

- Trackea la cantidad de créditos que se tienen en la carrera, incluyendo si se quiere terminar con tésis/tpp, y que orientación se elige

- Base de datos! Se pueden marcar todas las materias apobradas y guardarlas bajo un padrón (o cualquier clave).

- Poner materias en final! Para no olvidarse los finales colgados.

---

## Desarrollo

Para agregar un feature o fixear un issue hay que clonar el repositorio, instalar las dependencias con `npm install` y después correr la aplicación con `npm start`. En `localhost:3000/` va a estar corriendo la aplicación constantemente, y toda modificación que se haga al código se va a ver reflejada en la página.

Una vez terminados los cambios, con solo hacer un PR basta (porque la aplicación se compila automáticamente con cada push a master).

Hay que tener en cuenta que localmente no funciona la base de datos, para evitar que se le pueda pegar desde cualquier lado. Si se necesita arreglar algo que interactua con la db, pedirle a algún autor la API key correspondiente.
