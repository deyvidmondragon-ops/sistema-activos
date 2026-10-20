require('dotenv').config();
const usuariosService = require('./services/usuarios.service');

async function main() {
  const admin = await usuariosService.crearUsuario({
    nombre: 'Admin Prueba',
    correo: 'admin@ejemplo.com',
    password: 'Admin12345',
    id_rol: 1,
  });
  console.log('Admin creado:', admin);
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});