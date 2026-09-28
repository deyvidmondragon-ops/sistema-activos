const catalogosService = require('../services/catalogos.service');

// Genera un controlador para cada catálogo, ya que todos hacen lo mismo
function responderCon(funcionServicio) {
  return async (req, res) => {
    try {
      const datos = await funcionServicio();
      res.status(200).json(datos);
    } catch (error) {
      console.error('Error al consultar catálogo:', error.message);
      res.status(500).json({ error: 'Error interno al consultar el catálogo' });
    }
  };
}

module.exports = {
  tiposActivo: responderCon(catalogosService.listarTiposActivo),
  tiposMantenimiento: responderCon(catalogosService.listarTiposMantenimiento),
  ubicaciones: responderCon(catalogosService.listarUbicaciones),
  roles: responderCon(catalogosService.listarRoles),
};