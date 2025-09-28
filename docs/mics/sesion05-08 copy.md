Sesion : 05/09/2025 - 08/09/2025


##Problems in this sesion.
#1. the website is not showing the changes, that I am implementing in the gameIntroPage.
    solution clean the cache in parcel : rm -rf .parcel-cache dist
#2. Eventhought the user make the login the page catch the error fail to login access. {
  GameIntroPage.ts:61 Failed to load user ❌: Error: No token found
    at getCurrentUser (api.ts:42:21)
    at GameIntroPage (GameIntroPage.ts:5:37)
    at router (router.ts:27:19)
GameIntroPage	@	GameIntroPage.ts:61
}

SOLVE : I was not saving the token in the jws so
add : localStorage.setItem("jwt", user.token); after succesfull login


2. Fix the gameIntroPage adding the complete squeme of the website. (GameIntroPage.ts)

3. Steps Done :
  3.1 Retrieve the function getCurrentUser.
    Import the user information calling this function and then store the values in two variables, in order show the information in the screen.

    Create the HTML in order to update with the format showed here :
    [text](https://www.figma.com/make/RkYYyeW3L4JAVYDKYJlPvu/Pong-Game-SPA-Design?node-id=0-1&t=cpiHY4V31aSZPBq6-1)

[] Are div in html.

    page Structure :
    { --> Header section
      [___________________________________________] div
        [----------------------------------------]
          |[user info]      |        [Login button]
          |[Welcome Message]|
        [----------------------------------------]
      [___________________________________________]

    }

##Changes.
1. change the #GameIntroPage to gameIntroPage.


##Concepts.

1. Inline Css Styling.
#Responsive Design : Using flex-box.
#Using css variables with tailwind css : theme-bg1, theme-bg2
#not using pure css anymore :
tailwind        || Css
min-h-screen    == min-height: 100vh;
flex            == display: flex;
flex-col        == flex-direction : column;
items-center    == align-items : center;
justify-start   == justify-content: flex-start;
p-8             == padding : 2rem;
----------------------------------------------
w-full          == with : 100%;
justify-between == justify-content: space-between;
items-center    == align-items: center;
mb-10           == margin-bottom = 2.5rem


##3.3
  Remove the #routes.
    the new path will be intro, and the user will only access
    to this path if the credentials are correct. Also add a new button functionality.