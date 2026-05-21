/**
 * familyGuard.js — Helpers de pertenencia a la familia.
 * Garantizan que un usuario sólo acceda a datos de su propia familia.
 */
const FamilyMember = require('../models/FamilyMember')

/**
 * Busca un miembro y valida que pertenezca a la familia indicada.
 * @returns {Promise<object|null>}  el documento FamilyMember, o null si
 *          no existe, el id es inválido o pertenece a otra familia.
 */
async function miembroDeLaFamilia(miembroId, familiaId) {
  let miembro
  try {
    miembro = await FamilyMember.findById(miembroId)
  } catch (err) {
    return null // id con formato inválido
  }
  if (!miembro) return null
  if (String(miembro.familiaId) !== String(familiaId)) return null
  return miembro
}

module.exports = { miembroDeLaFamilia }
