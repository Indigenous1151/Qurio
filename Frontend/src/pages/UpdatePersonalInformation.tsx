
import { useState } from "react";
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';


export function UpdatePersonalInformation(){

    return(
    <div>
      <Navbar></Navbar>
        <h1>Update Personal Information!</h1>
        <p>This is the update personal information page.</p> 

        <Footer></Footer>
      </div>
    )
}