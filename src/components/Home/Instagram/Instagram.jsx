import React from "react";
import "./Instagram.css";
import insta1 from "../../../assets/Instagram/insta1.jpg";
import insta2 from "../../../assets/Instagram/insta2.jpg";
import insta3 from "../../../assets/Instagram/insta3.jpg";
import insta4 from "../../../assets/Instagram/insta4.jpg";
import insta5 from "../../../assets/Instagram/insta5.jpg";
import insta6 from "../../../assets/Instagram/insta6.jpg";
import insta7 from "../../../assets/Instagram/insta7.jpg";
import insta8 from "../../../assets/Instagram/insta8.jpg";
import insta9 from "../../../assets/Instagram/insta9.jpg";
import insta10 from "../../../assets/Instagram/insta10.jpg";
import insta11 from "../../../assets/Instagram/insta11.jpg";
import insta12 from "../../../assets/Instagram/insta12.jpg";

const Instagram = () => {
  return (
    <>
      <div className="instagram">
        <h2>CUSTOMER OF SHOP</h2>
        <div className="instagramTiles">
          <div className="instagramtile">
            <img src={insta1} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta2} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta3} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta4} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta5} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta6} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta7} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta8} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta9} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta10} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta11} alt="" />
          </div>
          <div className="instagramtile">
            <img src={insta12} alt="" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Instagram;
