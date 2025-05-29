const request = require('supertest');
const express = require('express');
const offersRouter = require('../routes/offers');
const Offer = require('../models/offers');

jest.mock('../models/offers'); //permet de remplacer Offer par une version simulée, donc pas de vraie base de données utilisée ici

//On crée une mini application Express uniquement pour les tests. 
//On y connecte le routeur offersRouter, comme dans notre projet.
const app = express();
app.use(express.json());
app.use('/', offersRouter);


describe('POST /add', () => { //crée un groupe de test pour /add
  beforeEach(() => { //réinitialise tous les mocks avant chaque test (très important pour éviter les effets de bord).
    jest.clearAllMocks();
  });
  
//Offre valide = avec tous les champs obligatoires
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

  //Test 1 : ajout réussi 
  //1. Simule un new Offer(...).save() qui réussit (mockResolvedValue({})).
  it('should add a new offer and return success', async () => {
    Offer.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({}),
    }));

    //2. Fait une requête POST avec l’offre valide
    const res = await request(app).post('/add').send(validOffer);

    //3. Vérification
    expect(res.statusCode).toBe(200); //le serveur répond
    expect(res.body.result).toBe(true); //result = true
    expect(Offer).toHaveBeenCalledWith(expect.objectContaining(validOffer)); //le constructeur Offer(...) a été appelé avec les bonnes données
  });

  //Test 2 : champ obligatoire est manquant
  //1. simule un champ manquant = titre
  it('should return error if required fields are missing', async () => {
    const { title, ...incompleteOffer } = validOffer; 

    //2. Fait une requête post avec cette offre invalide
    const res = await request(app).post('/add').send(incompleteOffer);

    //3. Vérification
    expect(res.statusCode).toBe(200); // toujours 200, mais erreur dans le body
    expect(res.body.result).toBe(false); 
    expect(res.body.error).toMatch(/Missing or empty fields/);
    expect(Offer).not.toHaveBeenCalled(); //aucune tentative de sauvegarde dans la base (Offer n’est pas appelé)
  });

  //Test 3 : Erreur de base de données si .save() échoue.
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