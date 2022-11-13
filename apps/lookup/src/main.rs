#[macro_use]
extern crate rocket;
use lookup::{handle_duke, handle_unc, scrape_duke, scrape_unc2};

#[launch]
async fn rocket() -> _ {
    let unc_lookup = scrape_unc2().await.unwrap();
    let duke_lookup = scrape_duke().await.unwrap();
    rocket::build()
        .manage(lookup::UNCLookup(unc_lookup))
        .manage(lookup::DukeLookup(duke_lookup))
        .mount("/", routes![handle_unc, handle_duke])
}
