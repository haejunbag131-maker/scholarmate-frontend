import "../assets/css/Home.css";

import Slider from "../components/home/Slider"; 
import CommunityNotice from "../components/home/CommunityNotice";
import FeatureSection from "../components/home/FeatureSection";
import CardSection from "../components/home/CardSection";
import WorkSection from "../components/home/WorkSection";
import LatestNewsSection from "../components/home/LatestNewsSection";
import ContactSection from "../components/home/ContactSection";
import Footer from "../components/home/Footer"; 

export default function Home() {
  return (
    <div className="home-container pb-0">
      <Slider />
      <CommunityNotice />
      <FeatureSection />
      <CardSection />
      <WorkSection />
      <LatestNewsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
