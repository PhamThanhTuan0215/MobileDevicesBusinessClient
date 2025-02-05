import React from "react";
import Banner from "../components/Home/Banner/Banner";
import CollectionBox from "../components/Home/Collection/CollectionBox";
import Services from "../components/Home/Services/Services";
import Instagram from "../components/Home/Instagram/Instagram";
// import LimitedEdition from "../components/Home/Limited/LimitedEdition";
import DealTimer from "../components/Home/Deal/DealTimer";
export const Home = () => {

    return (
        <>
            <CollectionBox />
            <DealTimer />
            <Banner />
            <Instagram />
            <Services />
        </>
    )
}