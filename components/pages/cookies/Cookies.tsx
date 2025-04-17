import CookieTips from "@/components/pages/cookies/CookieTips.tsx";
import CookieData from "@/components/pages/cookies/CookieData.tsx";
import {Search} from "lucide-react";
import { useState } from "react";
import CookieReader from "./CookieReader";

const values = []

function Cookies(){
    return (
      <>  
         <div>

            <CookieReader/>

            
            
          </div>
      </>
    );

}

export default Cookies;