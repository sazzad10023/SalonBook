import Banner from "@/components/Banner";
import FeaturedServices from "@/components/FeaturedServices";
import SalonSections from "@/components/SalonSections";
import WhyChooseUs from "@/components/why-choose-us";



export default function Home() {
  return (
    <div >
      
     <Banner></Banner>
      <SalonSections />
      <WhyChooseUs />
              <FeaturedServices />

  
    </div>
  );
}
