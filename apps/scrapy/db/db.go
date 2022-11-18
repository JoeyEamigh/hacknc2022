package db

import (
	"os"

	"github.com/JoeyEamigh/hacknc2022/go-schema"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

var Database *gorm.DB

func ConnectToDatabase() error {
	dsn := os.Getenv("DATABASE_DSN")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{NamingStrategy: schema.NamingStrategy})
	Database = db
	db.AutoMigrate(&schema.School{})

	return err
}

func UpsertSchool(school *schema.School) error {
	return Database.Session(&gorm.Session{FullSaveAssociations: true}).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "rmpId"}},
		UpdateAll: true,
	}).Create(school).Error
}
