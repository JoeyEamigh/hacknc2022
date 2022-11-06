package server

import (
	"os"
	"time"

	"github.com/JoeyEamigh/hacknc2022/types"
	"github.com/google/uuid"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DATABASE *gorm.DB

func ConnectToDatabase() error {
	dsn := os.Getenv("DATABASE_DSN")
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	DATABASE = db

	return err
}

func GetTeacher(firstName, lastName, department string) (*types.Teacher, error) {
	cond := &types.Teacher{
		FirstName:  firstName,
		LastName:   lastName,
		Department: department,
	}

	var teacher types.Teacher
	err := DATABASE.Where(cond).First(&teacher).Error

	return &teacher, err
}

func UpdateTeacher(teacher *types.Teacher) error {
	return DATABASE.Save(teacher).Error
}

func UpdateTeacherIfOld(teacher *types.Teacher, maxAge time.Duration) error {
	oldTeacher, err := GetTeacher(teacher.FirstName, teacher.LastName, teacher.Department)

	if err != nil {
		return err
	}

	if time.Since(oldTeacher.UpdatedAt) > maxAge {
		teacher.ID = oldTeacher.ID
		teacher.SchoolID = oldTeacher.SchoolID
		return UpdateTeacher(teacher)
	}

	return nil
}

func CreateTeacher(teacher *types.Teacher) error {
	teacher.ID = uuid.New().String()
	teacher.SchoolID = teacher.School.ID

	return DATABASE.Create(teacher).Error
}

func CreateTeacherOrUpdateIfOld(teacher *types.Teacher, maxAge time.Duration) error {
	cond := &types.Teacher{
		FirstName:  teacher.FirstName,
		LastName:   teacher.LastName,
		Department: teacher.Department,
	}

	var oldTeacher types.Teacher
	err := DATABASE.Where(cond).Limit(1).Find(&oldTeacher).Error

	if err != nil {
		return err
	}

	if oldTeacher.ID == "" {
		return CreateTeacher(teacher)
	}

	teacher.ID = oldTeacher.ID
	teacher.SchoolID = oldTeacher.SchoolID

	if time.Since(oldTeacher.UpdatedAt) > maxAge {
		return UpdateTeacher(teacher)
	}

	return nil
}

func CreateSchool(school *types.School) error {
	return DATABASE.Create(school).Error
}

func CreateSchoolIfNotExists(school *types.School) error {
	var _school types.School // dummy variable to check if school exists
	return DATABASE.FirstOrCreate(&_school, school).Error
}
