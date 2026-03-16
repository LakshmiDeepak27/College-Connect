import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hersection from '../components/HeroSection';
import { AboutSection } from '../components/AboutSection';
import { DepartmentSection } from '../components/DepartmentSection';
import {Community} from '../components/communitySection';
import {Footer} from '../components/Footer';
const Konnectia = () => {
 
  return (
    <div className="bg-black text-white min-h-screen">
  
     
        <Navbar></Navbar>
        <Hersection></Hersection>
        <AboutSection></AboutSection>
        <DepartmentSection></DepartmentSection>
        <Community></Community>
        <Footer></Footer>
    </div>
  );
};

export default Konnectia;