import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:8080';

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
  http.get(`${BASE_URL}/gestionnaire/stages`, ({ request }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year');
    
    const stages = getStagesByYear(year);
    
    return HttpResponse.json({
      message: 'Liste des stages',
      data: stages
    });
  }),

  http.put(`${BASE_URL}/gestionnaire/stages/:id/approuver`, ({ params }) => {
    const stageId = params.id;
    return HttpResponse.json({
      message: 'Stage approuvé avec succès',
      data: { id: stageId, status: 'APPROUVEE' }
    });
  }),

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
  }),


  http.get(`${BASE_URL}/etudiant/candidatures`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          status: 'SOUMISE',
          datePostulation: '2025-01-15T10:00:00Z',
          stage: {
            id: 10,
            title: 'Développeur Web Full Stack',
            description: 'Stage en développement web',
            location: 'Montréal',
            compensation: '25$/h',
            employeur: {
              company: 'Tech Corp'
            },
            skills: ['React', 'Node.js']
          }
        },
        {
          id: 2,
          status: 'ACCEPTEE',
          datePostulation: '2025-01-10T10:00:00Z',
          dateDecision: '2025-01-20T10:00:00Z',
          stage: {
            id: 11,
            title: 'Stage en Data Science',
            description: 'Stage en analyse de données',
            location: 'Québec',
            compensation: '30$/h',
            employeur: {
              company: 'Data Inc'
            },
            skills: ['Python', 'Machine Learning']
          }
        },
        {
          id: 3,
          status: 'CONFIRMER',
          datePostulation: '2025-01-05T10:00:00Z',
          stage: {
            id: 12,
            title: 'Stage Accepté',
            description: 'Stage confirmé',
            location: 'Montréal',
            compensation: '28$/h',
            employeur: {
              company: 'Success Corp'
            },
            skills: ['Java', 'Spring']
          }
        }
      ]
    });
  }),

  http.get(`${BASE_URL}/etudiant/candidatures/:id/entente`, ({ params }) => {
    const { id } = params;
    if (id === '3') {
      // Retourner une entente SIGNEE pour tester les deux boutons
      return HttpResponse.json({
        data: {
          id: 1,
          status: 'SIGNEE',
          dateSignatureEtudiant: '2025-01-15T10:00:00Z',
          dateSignatureEmployeur: '2025-01-16T10:00:00Z',
          documentPdfBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDI3CiUlRU9G',
          documentName: 'entente_stage_3.pdf'
        }
      });
    }
    return HttpResponse.json({ message: 'Entente non trouvée' }, { status: 404 });
  }),

  http.put(`${BASE_URL}/etudiant/candidatures/respond`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      message: body.accepted ? 'Offre acceptée avec succès' : 'Offre refusée avec succès',
      data: {
        id: body.candidatureId,
        status: body.accepted ? 'CONFIRMER' : 'REFUSEE_ETUDIANT',
        decision: body.comment || ''
      }
    });
  }),

  http.put(`${BASE_URL}/etudiant/ententes/:id/signer`, async ({ request }) => {
    const body = await request.json();
    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 });
    }
    return HttpResponse.json({
      message: 'Entente signée avec succès'
    });
  }),

  http.get(`${BASE_URL}/etudiant/telecharger-cv/:email`, () => {
    return HttpResponse.json({
      data: {
        fileName: 'cv.pdf',
        fileData: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDI3CiUlRU9G',
        contentType: 'application/pdf'
      }
    });
  }),

  // Handlers pour Gestionnaire - Ententes
  // GET /gestionnaire/candidatures/:candidatureId/entente
  http.get(`${BASE_URL}/gestionnaire/candidatures/:candidatureId/entente`, ({ params }) => {
    const { candidatureId } = params;
    // Pour la candidature 4 (CONFIRMER dans mockEtudiants2027), retourner une entente SIGNEE
    if (candidatureId === '4') {
      return HttpResponse.json({
        message: 'Entente trouvée',
        data: {
          id: 1,
          status: 'SIGNEE',
          dateSignatureEtudiant: '2025-01-15T10:00:00Z',
          dateSignatureEmployeur: '2025-01-16T10:00:00Z',
          documentPdfBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDI3CiUlRU9G',
          documentName: 'entente_stage_4.pdf'
        }
      });
    }
    return HttpResponse.json({ message: 'Entente non trouvée' }, { status: 404 });
  }),

  // POST /gestionnaire/candidatures/:candidatureId/generer-entente
  http.post(`${BASE_URL}/gestionnaire/candidatures/:candidatureId/generer-entente`, ({ params }) => {
    const { candidatureId } = params;
    return HttpResponse.json({
      message: 'Entente générée avec succès',
      data: {
        id: 1,
        status: 'A_SIGNER',
        dateSignatureEtudiant: null,
        dateSignatureEmployeur: null,
        documentPdfBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDI3CiUlRU9G',
        documentName: `entente_stage_${candidatureId}.pdf`
      }
    });
  }),

  // PUT /gestionnaire/ententes/:ententeId/signer
  http.put(`${BASE_URL}/gestionnaire/ententes/:ententeId/signer`, async ({ request }) => {
    const body = await request.json();
    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 });
    }
    return HttpResponse.json({
      message: 'Entente signée avec succès'
    });
  }),

  // GET /employeur/candidatures/:candidatureId/entente (pour ApplicantRow)
  http.get(`${BASE_URL}/employeur/candidatures/:candidatureId/entente`, ({ params }) => {
    const { candidatureId } = params;
    // Retourner une entente SIGNEE pour tester
    if (candidatureId === '1') {
      return HttpResponse.json({
        message: 'Entente trouvée',
        data: {
          id: 1,
          status: 'SIGNEE',
          dateSignatureEtudiant: '2025-01-15T10:00:00Z',
          dateSignatureEmployeur: '2025-01-16T10:00:00Z',
          documentPdfBase64: 'JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgo1MCA3MDAgVGQKKEhlbGxvIFdvcmxkKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDI3CiUlRU9G',
          documentName: 'entente_stage_1.pdf'
        }
      });
    }
    return HttpResponse.json({ message: 'Entente non trouvée' }, { status: 404 });
  }),

  // PUT /employeur/ententes/:ententeId/signer (pour ApplicantRow)
  http.put(`${BASE_URL}/employeur/ententes/:ententeId/signer`, async ({ request }) => {
    const body = await request.json();
    if (body.password === 'wrong') {
      return HttpResponse.json({ message: 'Mot de passe incorrect' }, { status: 401 });
    }
    return HttpResponse.json({
      message: 'Entente signée avec succès'
    });
  }),

  http.get(`${BASE_URL}/employeur/:email/stages`, ({ request, params }) => {
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || '2025';
    const email = params.email;

    const stages2024 = [
      {
        id: 4,
        title: 'Stage Développeur Backend',
        description: 'Développement backend avec Spring Boot',
        location: 'Montréal',
        compensation: '23$/h',
        status: 'PUBLIEE',
        startDate: '2024-01-15',
        endDate: '2024-04-30',
        skills: ['Java', 'Spring Boot', 'PostgreSQL'],
        createdAt: '2023-12-01T00:00:00Z'
      },
      {
        id: 5,
        title: 'Stage Data Analyst',
        description: 'Analyse de données business',
        location: 'Québec',
        compensation: '21$/h',
        status: 'APPROUVEE',
        startDate: '2024-05-01',
        endDate: '2024-08-31',
        skills: ['Excel', 'SQL', 'Tableau'],
        createdAt: '2024-01-15T00:00:00Z'
      }
    ];

    const stages2025 = [
      {
        id: 1,
        title: 'Stage Développeur Web',
        description: 'Développement d\'applications web modernes',
        location: 'Montréal',
        compensation: '25$/h',
        status: 'APPROUVEE',
        startDate: '2025-06-01',
        endDate: '2025-08-31',
        skills: ['React', 'Node.js', 'TypeScript'],
        createdAt: '2025-01-15T00:00:00Z'
      },
      {
        id: 2,
        title: 'Stage Analyste Données',
        description: 'Analyse de données et machine learning',
        location: 'Québec',
        compensation: '22$/h',
        status: 'PUBLIEE',
        startDate: '2025-09-01',
        endDate: '2025-12-31',
        skills: ['Python', 'SQL', 'Pandas'],
        createdAt: '2025-02-01T00:00:00Z'
      },
      {
        id: 3,
        title: 'Stage Designer UI/UX',
        description: 'Design d\'interfaces utilisateur',
        location: 'Montréal',
        compensation: '24$/h',
        status: 'SOUMISE',
        startDate: '2025-05-01',
        endDate: '2025-07-31',
        skills: ['Figma', 'Adobe XD'],
        createdAt: '2025-03-10T00:00:00Z'
      }
    ];

    const stages2026 = [
      {
        id: 6,
        title: 'Stage Développeur Web',
        description: 'Développement d\'applications web modernes',
        location: 'Montréal',
        compensation: '25$/h',
        status: 'APPROUVEE',
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        skills: ['React', 'Node.js', 'TypeScript'],
        createdAt: '2026-01-15T00:00:00Z'
      },
      {
        id: 7,
        title: 'Stage Analyste Données',
        description: 'Analyse de données et machine learning',
        location: 'Québec',
        compensation: '22$/h',
        status: 'PUBLIEE',
        startDate: '2026-09-01',
        endDate: '2026-12-31',
        skills: ['Python', 'SQL', 'Pandas'],
        createdAt: '2026-02-01T00:00:00Z'
      }
    ];

    const getStagesByYear = (yearParam) => {
      switch (yearParam) {
        case '2024':
          return stages2024;
        case '2025':
          return stages2025;
        case '2026':
          return stages2026;
        default:
          return stages2025;
      }
    };

    const stages = getStagesByYear(year);

    return HttpResponse.json({
      message: 'Trouvés',
      data: stages
    });
  })
];

