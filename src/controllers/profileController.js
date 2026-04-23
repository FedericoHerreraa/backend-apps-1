import * as firestoreUserService from '../services/firestoreUserService.js';

export async function getProfile(req, res) {
  try {
    const profile = await firestoreUserService.getUserDocument(req.user.uid);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      user: profile,
    });
  } catch (error) {
    console.error('Error en GET /profile/me:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil',
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const { name, phone, preferences } = req.body || {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'El nombre no puede estar vacío',
        });
      }
    }

    if (phone !== undefined && phone !== null && typeof phone !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'El teléfono debe ser un texto',
      });
    }

    if (preferences !== undefined && !Array.isArray(preferences)) {
      return res.status(400).json({
        success: false,
        error: 'Las preferencias deben ser una lista',
      });
    }

    if (name === undefined && phone === undefined && preferences === undefined) {
      return res.status(400).json({
        success: false,
        error: 'No se enviaron campos para actualizar',
      });
    }

    const updated = await firestoreUserService.updateUserProfile(req.user.uid, {
      name,
      phone,
      preferences,
    });

    return res.status(200).json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: updated,
    });
  } catch (error) {
    console.error('Error en PUT /profile/me:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al actualizar el perfil',
    });
  }
}
