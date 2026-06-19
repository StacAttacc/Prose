-- Script SQL pour corriger l'erreur "Unrecognized discriminator value: etudiant_cv"
-- 
-- Option 1: Supprimer les notifications obsolètes avec notification_type = 'etudiant_cv'
-- (Recommandé si ces notifications ne sont plus nécessaires)
DELETE FROM notification 
WHERE notification_type = 'etudiant_cv';

-- Option 2: Si vous voulez conserver les données, vous pouvez les mettre à jour vers une valeur valide
-- Par exemple, les convertir en 'cv_decision' si c'est approprié:
-- UPDATE notification 
-- SET notification_type = 'cv_decision' 
-- WHERE notification_type = 'etudiant_cv';

-- Option 3: Vérifier d'abord combien d'enregistrements sont affectés
-- SELECT COUNT(*) FROM notification WHERE notification_type = 'etudiant_cv';

-- Option 4: Voir les détails des enregistrements affectés avant de les supprimer
-- SELECT * FROM notification WHERE notification_type = 'etudiant_cv';

