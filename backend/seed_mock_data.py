"""Seed the application database with mock data."""

from app.seed import seed_initial_data


if __name__ == "__main__":
    print("Starting mock data seeding...")
    seed_initial_data()
    print("Mock data seeding completed.")
