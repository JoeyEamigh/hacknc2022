#[macro_use]
extern crate rocket;
use lookup::{handle_short_dept, scrape_unc};

#[launch]
async fn rocket() -> _ {
    let unc_lookup = scrape_unc().await.unwrap();
    println!("UNC Lookup: {:?}", unc_lookup);
    rocket::build()
        .manage(unc_lookup)
        .mount("/", routes![handle_short_dept])
}
