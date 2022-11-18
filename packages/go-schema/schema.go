package schema

import (
	"database/sql/driver"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/shopspring/decimal"
	"gorm.io/gorm/schema"
)

type LowerCamelReplacer struct{}

// Replace replaces the first letter of the given string to lower case. Assumes
// utf-8 encoding.
func (LowerCamelReplacer) Replace(s string) string {
	if s == "" {
		return s
	}

	r, n := utf8.DecodeRuneInString(s)
	return string(unicode.ToLower(r)) + s[n:]
}

// Default naming strategy to be used with this schema. Note that the name
// replacer works for both table and column names, so tables must always have
// the name overridden to work with Prisma.
var NamingStrategy = schema.NamingStrategy{
	SingularTable: true,
	NoLowerCase:   true,
	NameReplacer:  LowerCamelReplacer{},
}

// Teacher with the data returned from the RateMyProfessor API. Includes tags to
// help with unmarshaling JSON from the API, but also works with GORM.
type Teacher struct {
	ID string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	FirstName             string  `json:"firstName"`
	LastName              string  `json:"lastName"`
	Department            string  `json:"department"`
	NumRatings            int     `json:"numRatings"`
	AvgRating             float64 `json:"avgRating"`
	AvgDifficulty         float64 `json:"avgDifficulty"`
	WouldTakeAgainPercent float64 `json:"wouldTakeAgainPercent"`

	// note that this school has nothing to do with the relation to School, it's
	// only for JSON purposes
	School School `json:"school" gorm:"-"`

	SchoolID string `gorm:"type:uuid;column:schoolId"`
	Sections []Section

	UpdatedAt time.Time
}

func (Teacher) TableName() string {
	return "Teacher"
}

type School struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id;not null"`

	RMPID string `json:"id" gorm:"column:rmpId;uniqueIndex:rmpId"`
	Name  string `json:"name"`

	Teachers []Teacher
	Subjects []Subject
	Classes  []Class

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (School) TableName() string {
	return "School"
}

type Subject struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	Name string
	Slug string

	Classes []Class

	CreatedAt time.Time
	UpdatedAt time.Time
	SchoolID  string `gorm:"type:uuid;column:schoolId"`
}

func (Subject) TableName() string {
	return "Subject"
}

type Class struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	Name         string
	Number       string
	Hours        decimal.Decimal `gorm:"type:decimal(65,30)"` // prisma default decimal precision
	Equivalences []string        `gorm:"type:text[]"`

	Sections     []Section
	Comments     []Comment
	Aggregations ClassAggregations

	SchoolID  string `gorm:"type:uuid;column:schoolId"`
	SubjectID string `gorm:"type:uuid;column:subjectId"`

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (Class) TableName() string {
	return "Class"
}

type ClassAggregations struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	NumRatings     int
	CumRating      int
	Difficulty     int
	WouldRecommend int

	TotalFive  int
	TotalFour  int
	TotalThree int
	TotalTwo   int
	TotalOne   int

	ClassID string `gorm:"type:uuid;column:classId"`

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (ClassAggregations) TableName() string {
	return "ClassAggregations"
}

type Section struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	Number      string
	Room        string
	Instruction string

	Term Term `gorm:"type:Term"`
	Year int

	Comments []Comment

	TeacherID string `gorm:"type:uuid;column:teacherId"`
	ClassID   string `gorm:"type:uuid;column:classId"`

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (Section) TableName() string {
	return "Section"
}

type Term string

const (
	JanuaryTerm Term = "JANUARY"
	SpringTerm  Term = "SPRING"
	SummerTerm  Term = "SUMMER"
	FallTerm    Term = "FALL"
	WinterTerm  Term = "WINTER"

	// SQL statement required to create the Term type in the database
	TermSQL string = "create type Term as enum ('JANUARY', 'SPRING', 'SUMMER', 'FALL', 'WINTER');"
)

func (t *Term) Scan(value interface{}) error {
	*t = Term(value.([]byte))
	return nil
}

func (t Term) Value() (driver.Value, error) {
	return string(t), nil
}

type Comment struct {
	ID string `gorm:"primaryKey;type:uuid;default:gen_random_uuid();column:id"`

	Text string

	Rating     int
	Difficulty int
	Recommend  bool

	SectionID string `gorm:"type:uuid;column:sectionId"`
	ClassID   string `gorm:"type:uuid;column:classId"`
	UserID    string `gorm:"type:uuid;column:userId"`

	CreatedAt time.Time
	UpdatedAt time.Time
}

func (Comment) TableName() string {
	return "Comment"
}
