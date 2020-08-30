'use strict';

// Global vars
let main_dataLoaded = false;
let main_visData = [];
let main_radialVis = null;
let main_filters = {
    question: 'go_outside',
    target: 'Election 2020',
};

// IIFE
(() => {

    // Instantiate Radial Vis
    main_radialVis = new RadialVis('radialVis');

    // Set off fetch, query and vis wrangle
    main_fetchData();

    // Instantiate Scroll Control
    const scrollControl = new ScrollControl([
        {
            target_id: `fixture1A`,
            task: `scroll_start_off_to_on_top`,
            determinant_id: `slide1`
        },
        {
            target_id: `fixture1B`,
            task: `scroll_start_off_to_on_right`,
            determinant_id: `slide1`,
            trigger: main_radialVis.manage_visibility.bind(main_radialVis),
        },
        {
            target_id: `side1B`,
            task: `scroll_start_on_to_off_right`,
            determinant_id: `slide1`,
        },
        {
            target_id: `go_outside`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_dining_in`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_dining_out`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_public_transport`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_shopping`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        /*{
            target_id: `go_barber_salon`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_friend_handshake`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },*/
        {
            target_id: `go_gym`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_friends_house`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_sporting_event`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_movie_theater`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `go_hospital`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        /*{
            target_id: `go_travel_neighbor_state`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },*/
        {
            target_id: `go_flight`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        /*{
            target_id: `go_travel_another_country`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },*/
        {
            target_id: `fixture2A`,
            task: `scroll_start_off_to_on_top`,
            determinant_id: `transSlide`
        },
        {
            target_id: `go_vote`,
            task: `scroll_in_container`,
            trigger: main_updateFilterQuestion,
        },
        {
            target_id: `fixture3A`,
            task: `scroll_start_off_to_on_bottom`,
            determinant_id: `transSlide`
        },
        {
            target_id: `slab1`,
            task: `scroll_start_on_to_off_bottom`,
            determinant_id: `botBar`
        },
    ]);


})();

/**
 * @function main_fetchData
 * Fetches CSV, defines data in memory, and calls query
 *
 * returns void
 */
function main_fetchData() {
    d3.csv('./static/data/vis_extracts.csv', d => {
        return d;
    }).then(d => {
        main_dataLoaded = true;
        main_visData = d;
        main_queryData();
    }).catch(err => {
        console.log(err)
    });
}

/**
 * @function main_updateFilterTarget
 * Updates the data filter
 *
 * returns void
 */
function main_updateFilterTarget(select) {
    main_filters.target = select.value;
    main_queryData();
}

/**
 * @function main_updateFilterQuestion
 * Updates the data filter
 *
 * returns void
 */
function main_updateFilterQuestion(val) {
    if (main_dataLoaded && val !== main_filters.question) {
        main_filters.question = val;
        main_queryData();
    }
}


/**
 * @function main_queryData
 * Mocks db extraction from frontend using d3 library
 *
 * returns void
 */
function main_queryData() {
    // Filter display
    const displayData = main_visData.filter(d => d['Question'] === main_filters.question);
    // Pass to Radial Vis
    main_radialVis.wrangle(displayData, main_filters);
}

