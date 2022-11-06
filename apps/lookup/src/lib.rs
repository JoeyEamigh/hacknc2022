use regex::Regex;
use rocket::serde::{json::Json, Serialize};
use rocket::{get, State};
use std::collections::HashMap;

#[derive(Serialize)]
#[serde(crate = "rocket::serde")]
pub struct Response {
    pub long: String,
}

#[get("/unc/<short_dept>")]
pub async fn handle_short_dept(
    short_dept: &str,
    unc_lookup: &State<HashMap<String, String>>,
) -> Result<Json<Response>, rocket::http::Status> {
    match unc_lookup.get(short_dept.to_uppercase().trim()) {
        Some(long_dept) => Ok(Json(Response {
            long: long_dept.to_string(),
        })),
        None => Err(rocket::http::Status::NotFound),
    }
}

#[derive(Debug)]
pub enum ScrapeErrors {
    ReqwestError(reqwest::Error),
    ParseError(tl::errors::ParseError),
    RegexError(regex::Error),
    Str(String),
}

impl From<reqwest::Error> for ScrapeErrors {
    fn from(err: reqwest::Error) -> Self {
        ScrapeErrors::ReqwestError(err)
    }
}

impl From<tl::errors::ParseError> for ScrapeErrors {
    fn from(err: tl::errors::ParseError) -> Self {
        ScrapeErrors::ParseError(err)
    }
}

impl From<regex::Error> for ScrapeErrors {
    fn from(err: regex::Error) -> Self {
        ScrapeErrors::RegexError(err)
    }
}

impl From<&str> for ScrapeErrors {
    fn from(err: &str) -> Self {
        ScrapeErrors::Str(String::from(err))
    }
}

const UNC_URL: &str = "https://catalog.unc.edu/courses/";

pub async fn scrape_unc() -> Result<HashMap<String, String>, ScrapeErrors> {
    let body = reqwest::get(UNC_URL).await?.text().await?;

    let dom = tl::parse(&body, tl::ParserOptions::default())?;
    let parser = dom.parser();

    let re = Regex::new(r"(?P<long>.+) \((?P<short>[A-Z]{4})")?;
    Ok(dom
        .get_element_by_id("atozindex")
        .and_then(|handle| handle.get(parser))
        .and_then(|node| node.as_tag())
        .and_then(|tag| tag.query_selector(parser, "a[href]"))
        .ok_or("could not get a[href]")?
        .filter_map(|handle| {
            let inner_text = &handle.get(parser)?.inner_text(parser);
            let caps = re.captures(inner_text)?;
            Some((
                String::from(caps.name("short")?.as_str()),
                String::from(caps.name("long")?.as_str()),
            ))
        })
        .collect::<_>())
}
