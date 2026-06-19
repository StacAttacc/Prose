-- Script pour supprimer la contrainte unique sur stage_id dans la table notification
-- Cette contrainte empêche de créer plusieurs notifications pour le même stage
-- Ce qui est nécessaire pour permettre la mise à jour des notifications d'entente

-- Étape 1: Vérifier la contrainte existante
-- SELECT constraint_name, constraint_type 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'notification' 
-- AND constraint_name = 'uklcxjuj60ngc9krq0a8frve93k';

-- Étape 2: Supprimer la contrainte unique
ALTER TABLE notification DROP CONSTRAINT IF EXISTS uklcxjuj60ngc9krq0a8frve93k;

-- Note: Si la contrainte a un nom différent, vous pouvez trouver toutes les contraintes uniques sur stage_id avec:
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'notification' 
-- AND constraint_type = 'UNIQUE'
-- AND constraint_name LIKE '%stage%';

