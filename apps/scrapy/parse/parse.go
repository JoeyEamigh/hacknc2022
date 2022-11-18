package parse

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/JoeyEamigh/hacknc2022/go-schema"
	"github.com/ericchiang/css"
	"github.com/shopspring/decimal"
	"golang.org/x/net/html"
)

func init() {
	err := CompileSelectors()
	if err != nil {
		panic(err)
	}
}

var (
	rowSelector *css.Selector
	colSelector *css.Selector
)

// CompileSelectors parses the selectors used to parse the table
func CompileSelectors() error {
	var err error

	rowSelector, err = css.Parse("tr")
	if err != nil {
		return err
	}

	colSelector, err = css.Parse("td")
	if err != nil {
		return err
	}

	return nil
}

// Term parses the raw term string from a scraper and converts it to a Term
// and the year as an int
func Term(rawTerm string) (schema.Term, int, error) {
	fields := strings.Fields(rawTerm)
	if len(fields) != 2 {
		return "", 0, fmt.Errorf("unable to parse rawTerm: %s", rawTerm)
	}

	year, err := strconv.Atoi(fields[0])
	if err != nil {
		return "", 0, err
	}

	// TODO(tslnc04): add conditions to handle Maymester, etc.
	switch term := schema.Term(strings.ToUpper(fields[1])); term {
	case schema.JanuaryTerm, schema.SpringTerm,
		schema.SummerTerm, schema.FallTerm, schema.WinterTerm:
		return term, year, nil
	}

	return "", 0, fmt.Errorf("unable to parse rawTerm term: %s", fields[1])
}

// GetNodeText performs a DFS on the given node and returns the text of all nodes
func GetNodeText(node *html.Node, builder *strings.Builder) string {
	if node.Type == html.TextNode {
		builder.WriteString(node.Data)
	}

	for c := node.FirstChild; c != nil; c = c.NextSibling {
		GetNodeText(c, builder)
	}

	return builder.String()
}

func GetClasses(table *html.Node) ([]schema.Class, error) {
	var err error
	var classes []schema.Class
	var currClass schema.Class
	for _, row := range rowSelector.Select(table) {
		cols := colSelector.Select(row)
		colsText := make([]string, len(cols))
		for i := range cols {
			colsText[i] = strings.TrimSpace(GetNodeText(cols[i], &strings.Builder{}))
		}

		if len(colsText) >= 13 && len(currClass.Sections) > 0 {
			classes = append(classes, currClass)
			currClass = schema.Class{}
		}

		var section schema.Section

		// listed in order defined in struct, not by column order
		section.Number = colsText[len(cols)-11]
		section.Room = colsText[len(cols)-4]
		section.Instruction = colsText[len(cols)-3]

		section.Term, section.Year, err = Term(colsText[len(cols)-8])
		if err != nil {
			return nil, err
		}

		currClass.Hours, err = decimal.NewFromString(colsText[len(cols)-7])
		if err != nil {
			return nil, err
		}

		if equivs := strings.Split(colsText[len(cols)-12], ", "); len(equivs) > 0 && equivs[0] != "" {
			currClass.Equivalences = equivs
		}

		if len(colsText) >= 13 {
			currClass.Number = colsText[len(cols)-13]
		}

		currClass.Sections = append(currClass.Sections, section)
	}

	return classes, nil
}
