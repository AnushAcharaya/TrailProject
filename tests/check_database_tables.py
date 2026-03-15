import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.db import connection

print("=" * 80)
print("DATABASE TABLES CHECK")
print("=" * 80)

with connection.cursor() as cursor:
    # Check medical_treatment table
    cursor.execute("SELECT COUNT(*) FROM medical_treatment")
    treatment_count = cursor.fetchone()[0]
    print(f"\nTreatments in database: {treatment_count}")
    
    # Check medical_medicine table
    cursor.execute("SELECT COUNT(*) FROM medical_medicine")
    medicine_count = cursor.fetchone()[0]
    print(f"Medicines in database: {medicine_count}")
    
    # Get all treatments with their medicine counts
    cursor.execute("""
        SELECT 
            t.id,
            t.treatment_name,
            COUNT(m.id) as medicine_count
        FROM medical_treatment t
        LEFT JOIN medical_medicine m ON m.treatment_id = t.id
        GROUP BY t.id, t.treatment_name
        ORDER BY t.id
    """)
    
    print("\n" + "=" * 80)
    print("TREATMENTS AND THEIR MEDICINE COUNTS:")
    print("=" * 80)
    
    for row in cursor.fetchall():
        treatment_id, treatment_name, med_count = row
        print(f"\nTreatment ID {treatment_id}: {treatment_name}")
        print(f"  Medicines: {med_count}")
    
    # Show all medicines
    if medicine_count > 0:
        print("\n" + "=" * 80)
        print("ALL MEDICINES IN DATABASE:")
        print("=" * 80)
        
        cursor.execute("""
            SELECT 
                m.id,
                m.name,
                m.dosage,
                m.frequency,
                m.duration,
                m.treatment_id,
                t.treatment_name
            FROM medical_medicine m
            JOIN medical_treatment t ON t.id = m.treatment_id
            ORDER BY m.treatment_id, m.id
        """)
        
        for row in cursor.fetchall():
            med_id, name, dosage, freq, duration, treatment_id, treatment_name = row
            print(f"\nMedicine ID {med_id}:")
            print(f"  Name: {name}")
            print(f"  Dosage: {dosage}")
            print(f"  Frequency: {freq}x/day")
            print(f"  Duration: {duration} days")
            print(f"  Treatment: {treatment_name} (ID: {treatment_id})")

print("\n" + "=" * 80)
