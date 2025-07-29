import React from 'react'
import HeroSection from './layouts/hero-section'
import SectorCategorySection from './components/landing-page/sector-categori-section'
import JumlahPendudukChart from './components/landing-page/jumlah-penduduk'
import PersentasePengangguranChart from './components/landing-page/persentase-pengangguran-chart'
import PencakerPenempatanChart from './components/landing-page/pencaker-penempatan-chart'
import TasikDataIntro from './components/landing-page/tasik-data-intro'

const page = () => {
  return (
    <div>
      <HeroSection/>
      <TasikDataIntro/>
      <JumlahPendudukChart/>
      <PersentasePengangguranChart/>
      <PencakerPenempatanChart/>
      <SectorCategorySection/>
    </div>
  )
}

export default page
