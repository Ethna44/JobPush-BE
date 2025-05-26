const request = require('supertest');
const express = require('express');
const offersRouter = require('../routes/offers');
const Offer = require('../models/offers');

jest.mock('../models/offers');

const app = express();
app.use(express.json());
app.use('/', offersRouter);

describe('POST /add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
//Ajout réussi d’une offre avec tous les champs obligatoires
  const validOffer = {
    title: "Développeur·se Web",
    compagny: "GreenTech",
    logoLink: "http://logo.com/logo.png",
    grade: 3,
    contractType: "CDI",
    publicationDate: "2025-05-01",
    streetNumber: 12,
    streetName: "Rue du Code",
    city: "Paris",
    zipCode: 75000,
    source: "Pôle Emploi",
    offerLink: "https://offre.com/1234",
    description: "Poste passionnant pour dev fullstack JS"
  };

  it('should add a new offer and return success', async () => {
    Offer.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
    }));

    const res = await request(app).post('/add').send(validOffer);

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(true);
    expect(Offer).toHaveBeenCalledWith(expect.objectContaining(validOffer));
  });

//Erreur de validation si un champ obligatoire est manquant.
  it('should return error if required fields are missing', async () => {
    const { title, ...incompleteOffer } = validOffer; // simulate missing title

    const res = await request(app).post('/add').send(incompleteOffer);

    expect(res.statusCode).toBe(200); // toujours 200, mais erreur dans le body
    expect(res.body.result).toBe(false);
    expect(res.body.error).toMatch(/Missing or empty fields/);
    expect(Offer).not.toHaveBeenCalled();
  });

//Erreur de base de données si .save() échoue.
  it('should return error if save fails', async () => {
    Offer.mockImplementation(() => ({
      save: jest.fn().mockRejectedValue(new Error('DB error')),
    }));

    const res = await request(app).post('/add').send(validOffer);

    expect(res.statusCode).toBe(200);
    expect(res.body.result).toBe(false);
    expect(res.body.error).toBe('DB error');
  });
});