import {Link} from "react-router-dom"
import React, {useEffect, useContext, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header(){
    const {setUserInfo, userInfo} = useContext(UserContext);
    useEffect(() => {
        fetch('http://localhost:4000/profile',{
            credentials:'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                console.log(userInfo);
            });
        });
    }, []);

    function logout(){
        fetch('http://localhost:4000/logout', {
            credentials: 'include',
            method:  'POST',
        });
        setUserInfo(null);
    }

    return(      
        <header>
            <Link to="/" className="logo">MyBlog</Link>
            <nav>
                {userInfo && userInfo.username && (
                    <>
                        {userInfo.role === 'admin' && <Link to="/create">Create new post</Link>}
                        <a onClick={logout}>Logout</a>
                    </>
                )}
                {!userInfo || !userInfo.username && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}

            </nav>
        </header>
    );
}