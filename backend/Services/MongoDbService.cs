using MongoDB.Driver;
using HospitalManagement.Api.Models;

namespace HospitalManagement.Api.Services;

public class MongoDbService
{
    private readonly IMongoDatabase _database;

    public MongoDbService(IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("MongoDB:ConnectionString").Value
            ?? "mongodb://localhost:27017";
        var databaseName = configuration.GetSection("MongoDB:DatabaseName").Value
            ?? "hospital_db";

        var settings = MongoClientSettings.FromConnectionString(connectionString);
        var client = new MongoClient(settings);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<Admin> Admins => _database.GetCollection<Admin>("admins");
    public IMongoCollection<Doctor> Doctors => _database.GetCollection<Doctor>("doctors");
    public IMongoCollection<Patient> Patients => _database.GetCollection<Patient>("patients");
    public IMongoCollection<Appointment> Appointments => _database.GetCollection<Appointment>("appointments");
    public IMongoCollection<BloodAvailability> BloodAvailability => _database.GetCollection<BloodAvailability>("bloodavailabilities");
    public IMongoCollection<BloodDonor> BloodDonors => _database.GetCollection<BloodDonor>("blooddonors");
    public IMongoCollection<BloodRecipient> BloodRecipients => _database.GetCollection<BloodRecipient>("bloodrecipients");
    public IMongoCollection<Medicine> Medicines => _database.GetCollection<Medicine>("medicines");
    public IMongoCollection<MedicineBill> MedicineBills => _database.GetCollection<MedicineBill>("medicinebills");
    public IMongoCollection<Equipment> Equipment => _database.GetCollection<Equipment>("equipments");
    public IMongoCollection<HealthCard> HealthCards => _database.GetCollection<HealthCard>("healthcards");
    public IMongoCollection<WardBooking> WardBookings => _database.GetCollection<WardBooking>("wardbookings");
    public IMongoCollection<CabinBooking> CabinBookings => _database.GetCollection<CabinBooking>("cabinbookings");
    public IMongoCollection<Prescription> Prescriptions => _database.GetCollection<Prescription>("prescriptions");
    public IMongoCollection<TestAndServicesBill> TestAndServicesBills => _database.GetCollection<TestAndServicesBill>("testandservicesbills");
    public IMongoCollection<ChatbotLog> ChatbotLogs => _database.GetCollection<ChatbotLog>("chatbots");
}
