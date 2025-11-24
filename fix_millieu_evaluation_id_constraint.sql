-- Script SQL pour corriger la contrainte NOT NULL sur millieu_evaluation_id
-- 
-- Le problème: La colonne millieu_evaluation_id a une contrainte NOT NULL mais n'a pas de séquence/auto-increment
-- 
-- Solution: Créer une séquence et l'associer à la colonne

-- Étape 1: Créer la séquence si elle n'existe pas
CREATE SEQUENCE IF NOT EXISTS millieu_evaluation_millieu_evaluation_id_seq;

-- Étape 2: Définir la valeur actuelle de la séquence basée sur le max existant (si des données existent)
SELECT setval('millieu_evaluation_millieu_evaluation_id_seq', 
    COALESCE((SELECT MAX(millieu_evaluation_id) FROM millieu_evaluation), 0) + 1, 
    false);

-- Étape 3: Modifier la colonne pour utiliser la séquence comme DEFAULT
ALTER TABLE millieu_evaluation 
ALTER COLUMN millieu_evaluation_id 
SET DEFAULT nextval('millieu_evaluation_millieu_evaluation_id_seq');

-- Étape 4: Associer la séquence à la colonne (pour que la séquence soit supprimée si la colonne est supprimée)
ALTER SEQUENCE millieu_evaluation_millieu_evaluation_id_seq 
OWNED BY millieu_evaluation.millieu_evaluation_id;

-- Vérification: La colonne devrait maintenant avoir une valeur par défaut
-- SELECT column_name, column_default, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'millieu_evaluation' AND column_name = 'millieu_evaluation_id';

