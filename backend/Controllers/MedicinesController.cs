using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using HospitalManagement.Api.Models;
using HospitalManagement.Api.Services;

namespace HospitalManagement.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly MongoDbService _db;

    public MedicinesController(MongoDbService db)
    {
        _db = db;
    }

    private static readonly List<Medicine> SeedMedicines = new()
    {
        new Medicine
        {
            Name = "Napa Extra",
            GenericName = "Paracetamol + Caffeine",
            DosageForm = "Tablet",
            Strength = "500 mg + 65 mg",
            Price = 3.50m,
            Strip = 150,
            Manufacturer = "Beximco Pharmaceuticals Ltd.",
            Description = "Fast-acting relief for fever, acute headache, migraine, toothache, and muscular pain.",
            Image = "https://medex.com.bd/storage/images/packaging/napa-extra-500-mg-tablet-46174620412-i3-bln3jHqPSpAeDaGZfmhW.webp"
        },
        new Medicine
        {
            Name = "Ace Plus",
            GenericName = "Paracetamol + Caffeine",
            DosageForm = "Tablet",
            Strength = "500 mg + 65 mg",
            Price = 3.00m,
            Strip = 160,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Combination analgesic and antipyretic for quick relief from acute headache, body ache, and cold symptoms.",
            Image = "https://medex.com.bd/storage/images/packaging/ace-plus-500-mg-tablet-94190812997-i1-262BmBeqPiu3RGuLpLNF.jpg"
        },
        new Medicine
        {
            Name = "Seclo 20",
            GenericName = "Omeprazole",
            DosageForm = "Capsule",
            Strength = "20 mg",
            Price = 6.00m,
            Strip = 120,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Top-prescribed proton pump inhibitor for hyperacidity, gastric and duodenal ulcers, and acid reflux.",
            Image = "https://medex.com.bd/storage/images/packaging/seclo-20-mg-capsule-86285846171-i2-odoovS6FiR71QOxOlSAk.webp"
        },
        new Medicine
        {
            Name = "Maxpro 20",
            GenericName = "Esomeprazole Magnesium",
            DosageForm = "Tablet",
            Strength = "20 mg",
            Price = 8.00m,
            Strip = 100,
            Manufacturer = "Renata Limited",
            Description = "Advanced acid inhibitor for GERD, erosive esophagitis, severe heartburn, and gastric ulcer protection.",
            Image = "https://medex.com.bd/storage/images/packaging/maxpro-20-mg-tablet-11414064409-i1-pVhK0C8pZNFoIMztwlWS.jpg"
        },
        new Medicine
        {
            Name = "Sergel 20",
            GenericName = "Esomeprazole Magnesium",
            DosageForm = "Tablet",
            Strength = "20 mg",
            Price = 8.00m,
            Strip = 110,
            Manufacturer = "Healthcare Pharmaceuticals Ltd.",
            Description = "Effective acid suppression for healing of erosive esophagitis and long-term heartburn symptom relief.",
            Image = "https://medex.com.bd/storage/images/packaging/sergel-20-mg-tablet-80987725988-i1-Z05kxRKsuFRecXb2bGX9.jpg"
        },
        new Medicine
        {
            Name = "Losectil 20",
            GenericName = "Omeprazole",
            DosageForm = "Capsule",
            Strength = "20 mg",
            Price = 6.00m,
            Strip = 100,
            Manufacturer = "Eskayef Pharmaceuticals Ltd.",
            Description = "Effective relief for gastroesophageal reflux, dyspepsia, and NSAID-associated stomach irritation.",
            Image = "https://medex.com.bd/storage/images/packaging/losectil-20-mg-capsule-22649687197-i1-Fx2jw4LHMGxoz2KTCftg.jpeg"
        },
        new Medicine
        {
            Name = "Alatrol 10mg",
            GenericName = "Cetirizine Hydrochloride",
            DosageForm = "Tablet",
            Strength = "10 mg",
            Price = 4.00m,
            Strip = 140,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Antihistamine for seasonal allergic rhinitis, watery itchy eyes, running nose, and allergic skin hives.",
            Image = "https://medex.com.bd/storage/images/packaging/alatrol-10-mg-tablet-59253519459-i1-nvqoq1s3D8r2eKyhh6jy.jpg"
        },
        new Medicine
        {
            Name = "Fenadin 120",
            GenericName = "Fexofenadine Hydrochloride",
            DosageForm = "Tablet",
            Strength = "120 mg",
            Price = 9.00m,
            Strip = 90,
            Manufacturer = "Renata Limited",
            Description = "Non-sedating antihistamine for 24-hour relief of allergies, hay fever, and chronic urticaria without causing drowsiness.",
            Image = "https://medex.com.bd/storage/images/packaging/fenadin-120-mg-tablet-81563206769-i1-tuf4LBKI6QjQyt39mGLQ.jpeg"
        },
        new Medicine
        {
            Name = "Monas 10mg",
            GenericName = "Montelukast Sodium",
            DosageForm = "Tablet",
            Strength = "10 mg",
            Price = 17.50m,
            Strip = 70,
            Manufacturer = "The ACME Laboratories Ltd.",
            Description = "Leukotriene receptor blocker for prevention and chronic management of asthma and allergic rhinitis.",
            Image = "https://medex.com.bd/storage/images/packaging/monas-10-mg-tablet-2721166687-i1-T1G46PU6J5lk2EKX65u9.webp"
        },
        new Medicine
        {
            Name = "Tofen 1mg",
            GenericName = "Ketotifen Fumarate",
            DosageForm = "Tablet",
            Strength = "1 mg",
            Price = 3.50m,
            Strip = 100,
            Manufacturer = "Beximco Pharmaceuticals Ltd.",
            Description = "Allergy and asthma prophylactic treatment for prevention of allergic bronchial spasms.",
            Image = "https://medex.com.bd/storage/images/packaging/tofen-1-mg-tablet-3301964737-i1-W8QqEL4gWvbvNhhInfAh.jpg"
        },
        new Medicine
        {
            Name = "Bicozin",
            GenericName = "Vitamin B-Complex + Zinc",
            DosageForm = "Tablet",
            Strength = "Therapeutic Formula",
            Price = 3.50m,
            Strip = 180,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Daily multivitamin tablet with zinc for immunity boosting, cellular repair, and fighting physical fatigue.",
            Image = "https://medex.com.bd/storage/images/packaging/bicozin-tablet-23821595234-i1-mAQSjI76HOmR4THIQ2qj.jpg"
        },
        new Medicine
        {
            Name = "Bicozin Syrup",
            GenericName = "Vitamin B-Complex + Zinc",
            DosageForm = "Syrup",
            Strength = "100 ml",
            Price = 85.00m,
            Strip = 40,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "High-potency B-complex syrup with zinc for convalescence, poor appetite, and growth support in children and adults.",
            Image = "https://medex.com.bd/storage/images/packaging/bicozin-syrup-87135351785-i1-QBdEqgw39jakfNKKUQ6b.webp"
        },
        new Medicine
        {
            Name = "Calbo-D",
            GenericName = "Calcium Carbonate + Vitamin D3",
            DosageForm = "Tablet",
            Strength = "500 mg + 200 IU",
            Price = 7.50m,
            Strip = 120,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Essential bone nutrition for prevention and treatment of osteoporosis, rickets, and calcium deficiency.",
            Image = "https://medex.com.bd/storage/images/packaging/calbo-d-500-mg-tablet-95027650575-i2-G99IuxlboQEq9gXMuEGP.webp"
        },
        new Medicine
        {
            Name = "Filwel Gold",
            GenericName = "Multivitamins & Minerals (A to Z)",
            DosageForm = "Tablet",
            Strength = "32 Vital Nutrients",
            Price = 6.00m,
            Strip = 100,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Comprehensive A-Z daily dietary supplement with antioxidants for peak health, energy, and mental alertness.",
            Image = "https://medex.com.bd/storage/images/packaging/filwel-gold-tablet-13857855209-i1-0IQSQGVbibFyqK0KHlxI.jpeg"
        },
        new Medicine
        {
            Name = "Ciprocin 500mg",
            GenericName = "Ciprofloxacin",
            DosageForm = "Tablet",
            Strength = "500 mg",
            Price = 15.00m,
            Strip = 80,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Broad-spectrum antibacterial therapy for urinary, gastrointestinal, and severe respiratory bacterial infections.",
            Image = "https://medex.com.bd/storage/images/packaging/ciprocin-500-mg-tablet-43584522241-i1-8A5e27LEYpdu34OtBMoy.webp"
        },
        new Medicine
        {
            Name = "Zimax 250mg",
            GenericName = "Azithromycin",
            DosageForm = "Capsule",
            Strength = "250 mg",
            Price = 25.00m,
            Strip = 60,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Macrolide antibiotic for acute bacterial sinusitis, bronchitis, pharyngitis, and skin infections.",
            Image = "https://medex.com.bd/storage/images/packaging/zimax-250-mg-capsule-10342220185-i1-sLJp0yzlOzlMN2UwwT0K.webp"
        },
        new Medicine
        {
            Name = "Entacyd Plus",
            GenericName = "Aluminium + Magnesium Hydroxide + Simethicone",
            DosageForm = "Tablet",
            Strength = "400 mg",
            Price = 2.50m,
            Strip = 200,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Fast-acting chewable antacid with antiflatulent for heartburn, gas bloating, and acid indigestion relief.",
            Image = "https://medex.com.bd/storage/images/packaging/entacyd-plus-400-mg-chewable-tablet-2227451851-i1-k9eapjgiM9b5z5gvlXEL.webp"
        },
        new Medicine
        {
            Name = "Torax 10mg",
            GenericName = "Ketorolac Tromethamine",
            DosageForm = "Tablet",
            Strength = "10 mg",
            Price = 12.00m,
            Strip = 85,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Powerful non-narcotic pain reliever for short-term management of moderate to severe acute pain and post-op pain.",
            Image = "https://medex.com.bd/storage/images/packaging/torax-10-mg-tablet-75190872802-i1-s6W81ECFj0OOPIus5pF5.jpeg"
        },
        new Medicine
        {
            Name = "Bizoran 5/20",
            GenericName = "Amlodipine + Olmesartan Medoxomil",
            DosageForm = "Tablet",
            Strength = "5 mg + 20 mg",
            Price = 14.00m,
            Strip = 90,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Cardiovascular prescription medication for effective control and treatment of arterial hypertension.",
            Image = "https://medex.com.bd/storage/images/packaging/bizoran-5-mg-tablet-90446984040-i1-qWjbinKjMJMNJm9U6a1Z.png"
        },
        new Medicine
        {
            Name = "Flamyd 500mg",
            GenericName = "Metronidazole",
            DosageForm = "Tablet",
            Strength = "500 mg",
            Price = 3.00m,
            Strip = 140,
            Manufacturer = "Square Pharmaceuticals PLC",
            Description = "Antibacterial and antiprotozoal medicine for amoebic dysentery, dental infections, and pelvic infections.",
            Image = "https://medex.com.bd/storage/images/packaging/flamyd-500-mg-tablet-22335857427-i1-ooGsyWb6lejtsWqKZ4HZ.webp"
        },
        new Medicine
        {
            Name = "Napa Syrup",
            GenericName = "Paracetamol",
            DosageForm = "Syrup",
            Strength = "60 ml (120mg/5ml)",
            Price = 35.00m,
            Strip = 50,
            Manufacturer = "Beximco Pharmaceuticals Ltd.",
            Description = "Pleasant tasting pediatric paracetamol suspension for fever reduction, post-immunization pyrexia, and teething pain.",
            Image = "https://medex.com.bd/storage/images/packaging/napa-120-mg-syrup-2490148577-i2-8Fg5fd9qPBUj3rdoTM6O.webp"
        }
    };

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var meds = await _db.Medicines.Find(_ => true).ToListAsync();
        if (meds.Count <= 1)
        {
            // Seed full Bangladeshi medicine catalog
            await _db.Medicines.DeleteManyAsync(_ => true);
            foreach (var item in SeedMedicines)
            {
                item.Id = null; // Let Mongo generate clean ObjectId
            }
            await _db.Medicines.InsertManyAsync(SeedMedicines);
            meds = await _db.Medicines.Find(_ => true).ToListAsync();
        }
        return Ok(meds);
    }

    [HttpPost("seed")]
    [HttpPost("seed-bangladesh")]
    public async Task<IActionResult> SeedBangladesh()
    {
        await _db.Medicines.DeleteManyAsync(_ => true);
        var freshList = SeedMedicines.Select(m => new Medicine
        {
            Name = m.Name,
            GenericName = m.GenericName,
            DosageForm = m.DosageForm,
            Strength = m.Strength,
            Price = m.Price,
            Strip = m.Strip,
            Manufacturer = m.Manufacturer,
            Description = m.Description,
            Image = m.Image
        }).ToList();
        await _db.Medicines.InsertManyAsync(freshList);
        var count = await _db.Medicines.CountDocumentsAsync(_ => true);
        return Ok(new { message = $"Successfully seeded {count} Bangladeshi medicines!", count });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var med = await _db.Medicines.Find(m => m.Id == id).FirstOrDefaultAsync();
        if (med == null) return NotFound();
        return Ok(med);
    }

    [HttpPost("add")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Medicine med)
    {
        await _db.Medicines.InsertOneAsync(med);
        return Ok(new { message = "Medicine added to the list successfully!", medicine = med });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Medicine med)
    {
        med.Id = id;
        await _db.Medicines.ReplaceOneAsync(m => m.Id == id, med);
        return Ok(med);
    }

    [HttpPut("stock/{id}")]
    public async Task<IActionResult> UpdateStock(string id, [FromBody] int strip)
    {
        var filter = Builders<Medicine>.Filter.Eq(m => m.Id, id);
        var update = Builders<Medicine>.Update.Set(m => m.Strip, strip);
        await _db.Medicines.UpdateOneAsync(filter, update);
        return Ok(new { message = "Stock updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _db.Medicines.DeleteOneAsync(m => m.Id == id);
        return Ok(new { message = "Medicine deleted successfully" });
    }
}
