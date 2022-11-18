import json
import requests
import time

from bs4 import BeautifulSoup
from typing import Optional, TypedDict

url: str = 'https://reports.unc.edu/class-search/'

def get_soup(url: str, params: dict[str, str]) -> BeautifulSoup:
    resp = requests.get(url, params=params)
    return BeautifulSoup(resp.text, 'html.parser')

def get_subjects(soup: BeautifulSoup, list_id: Optional[str] = None) -> list[str]:
    subject_list = soup.find('script', id=list_id)
    return json.loads(subject_list.string)

def get_classes(soup: BeautifulSoup, table_id: Optional[str] = None):
    table = soup.find('table', id=table_id).tbody
    rows = table.find_all('tr')

    classes = []

    subject = ''
    curr_class = {'sections': []}
    for row in rows:
        cols = row.find_all('td')
        cols = [col.text.strip() for col in cols]

        if len(cols) >= 13 and len(curr_class['sections']) > 0:
            classes.append(curr_class)
            curr_class = {'sections': []}

        section: dict[str, str | int | float] = {}

        # Using reverse indexing since only the first couple of columns get
        # omitted for successive sections of the same class
        section['availableSeats'] = int(cols[-1])
        section['instructor'] = cols[-2]
        section['intructionType'] = cols[-3]
        section['room'] = cols[-4]
        section['schedule'] = cols[-5]
        section['meetingDates'] = cols[-6]
        curr_class['hours'] = float(cols[-7])
        section['term'] = cols[-8]
        curr_class['description'] = cols[-9]
        section['classNumber'] = int(cols[-10])
        section['classSection'] = cols[-11]
        if (sameAs := cols[-12].split(', ')) != ['']:
            curr_class['sameAs'] = sameAs
        else:
            curr_class['sameAs'] = []

        # Since the class number is has rowspan, update when we get a new one,
        # otherwise use the old one
        if len(cols) >= 13:
            curr_class['number'] = cols[-13]

        # This is the same as with class number. It should generally be
        # unnecessary, but just in case we want to have multiple subjects in one
        # query
        if len(cols) >= 14:
            subject = cols[-14]
        curr_class['subject'] = subject

        curr_class['sections'].append(section)

    return classes

if __name__ == '__main__':
    soup = get_soup(url, {'term': '2023 Spring', 'subject': 'MATH'})
    # subjects = get_subjects(soup, 'json_subjects')
    # print(subjects)
    classes = get_classes(soup, 'results-table')
    print(json.dumps(classes, indent=4))