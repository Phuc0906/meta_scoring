import React from "react";
import logo2 from '../assests/1_White.png'
import {Link} from "react-router-dom";
import {Authenticator} from "@aws-amplify/ui-react";

const NavBar = () => {
    return <div className="sticky top-0 z-40 flex justify-between items-center bg-[#222222] py-4 px-3">
        <div className="w-44 " >
            <img src={logo2} alt={"Logo"} />
        </div>
        <div className="mr-32 flex flex-row gap-4 items-center text-xl text-blue-400">
            <div >
                <Link to={`/`}>TRANG CHỦ</Link>
            </div>
            <div className={`relative w-fit`}>
                <Link to={`/group-stage`} >BẢNG ĐẤU</Link>
            </div>
            <div>
                <Link to={"/teams"} >ĐỘI DỰ THI</Link>
            </div>
            <Authenticator>
                {({ signOut, user }) => (
                    <div onMouseEnter={() => {
                    }}>
                        <button onClick={signOut} >Sign Out</button>
                    </div>
                )}
            </Authenticator>

        </div>
    </div>
}

export default NavBar;
