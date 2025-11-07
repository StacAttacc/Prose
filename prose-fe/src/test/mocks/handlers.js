import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080';

// Mock data pour les stages de différentes années
const mockStages2025 = [
  {
    id: 1,
    title: 'Stage Développeur 2025',
    description: 'Description du stage 2025',
    location: 'Montréal',
    compensation: '25$/h',
    status: 'SOUMISE',
    startDate: '2025-01-15',
    endDate: '2025-04-30',
    employeur: { company: 'TechCorp 2025', email: 'tech@example.com' },
    skills: ['React', 'Node.js'],
    createdAt: '2024-12-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Stage Analyste 2025',
    description: 'Description du stage analyste 2025',
    location: 'Québec',
    compensation: '22$/h',
    status: 'APPROUVEE',
    startDate: '2025-05-01',
    endDate: '2025-08-31',
    employeur: { company: 'DataCorp 2025', email: 'data@example.com' },
    skills: ['Python', 'SQL'],
    createdAt: '2024-12-01T00:00:00Z'
  }
];

const mockStages2026 = [
  {
    id: 3,
    title: 'Stage Développeur 2026',
    description: 'Description du stage 2026',
    location: 'Montréal',
    compensation: '26$/h',
    status: 'SOUMISE',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    employeur: { company: 'TechCorp 2026', email: 'tech2026@example.com' },
    skills: ['React', 'TypeScript'],
    createdAt: '2025-12-01T00:00:00Z'
  }
];

const mockStages2027 = [
  {
    id: 4,
    title: 'Stage Designer 2027',
    description: 'Description du stage designer 2027',
    location: 'Toronto',
    compensation: '24$/h',
    status: 'SOUMISE',
    startDate: '2027-01-15',
    endDate: '2027-04-30',
    employeur: { company: 'DesignCorp 2027', email: 'design@example.com' },
    skills: ['Figma', 'UI/UX'],
    createdAt: '2026-12-01T00:00:00Z'
  }
];

// Fonction pour retourner les stages selon l'année
const getStagesByYear = (year) => {
  switch (year) {
    case '2025':
      return mockStages2025;
    case '2026':
      return mockStages2026;
    case '2027':
      return mockStages2027;
    default:
      return [];
  }
};

export const handlers = [
  // Handler pour GET /gestionnaire/stages avec paramètre year
  http.get(`${BASE_URL}/gestionnaire/stages`, ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    
    const stages = getStagesByYear(year);
    
    return HttpResponse.json({
      message: 'Liste des stages',
      data: stages
    });
  }),

  // Handler pour PUT /gestionnaire/stages/:id/approuver
  http.put(`${BASE_URL}/gestionnaire/stages/:id/approuver`, ({ params }) => {
    const stageId = params.id;
    return HttpResponse.json({
      message: 'Stage approuvé avec succès',
      data: { id: stageId, status: 'APPROUVEE' }
    });
  }),

  // Handler pour PUT /gestionnaire/stages/:id/rejeter
  http.put(`${BASE_URL}/gestionnaire/stages/:id/rejeter`, async ({ params, request }) => {
    const stageId = params.id;
    const body = await request.json();
    return HttpResponse.json({
      message: 'Stage rejeté avec succès',
      data: { id: stageId, status: 'REJETEE', rejectionReason: body.reason }
    });
  }),

  http.get(`${BASE_URL}/gestionnaire/getCandidatures`, ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    
    const mockEtudiants2025 = [
      {
        etudiant: {
          id: 1,
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com'
        },
        candidatures: [
          {
            id: 1,
            status: 'SOUMISE',
            stage: {
              id: 1,
              title: 'Stage Développeur 2025',
              startDate: '2025-01-15'
            },
            datePostulation: '2024-12-01'
          }
        ]
      },
      {
        etudiant: {
          id: 2,
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@example.com'
        },
        candidatures: [
          {
            id: 2,
            status: 'ACCEPTEE',
            stage: {
              id: 2,
              title: 'Stage Analyste 2025',
              startDate: '2025-05-01'
            },
            datePostulation: '2024-12-01'
          }
        ]
      }
    ];

    const mockEtudiants2026 = [
      {
        etudiant: {
          id: 3,
          firstName: 'Pierre',
          lastName: 'Bernard',
          email: 'pierre.bernard@example.com'
        },
        candidatures: [
          {
            id: 3,
            status: 'SOUMISE',
            stage: {
              id: 3,
              title: 'Stage Développeur 2026',
              startDate: '2026-01-15'
            },
            datePostulation: '2025-12-01'
          }
        ]
      }
    ];

    const mockEtudiants2027 = [
      {
        etudiant: {
          id: 4,
          firstName: 'Sophie',
          lastName: 'Lefebvre',
          email: 'sophie.lefebvre@example.com'
        },
        candidatures: [
          {
            id: 4,
            status: 'CONFIRMER',
            stage: {
              id: 4,
              title: 'Stage Designer 2027',
              startDate: '2027-01-15'
            },
            datePostulation: '2026-12-01'
          }
        ]
      }
    ];

    // Fonction pour retourner les étudiants selon l'année
    const getEtudiantsByYear = (year) => {
      switch (year) {
        case '2025':
          return mockEtudiants2025;
        case '2026':
          return mockEtudiants2026;
        case '2027':
          return mockEtudiants2027;
        default:
          return [];
      }
    };

    const etudiants = getEtudiantsByYear(year);
    
    return HttpResponse.json({
      message: 'Trouvés',
      data: etudiants
    });
  })
];

