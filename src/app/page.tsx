"use client";
import {SignOutButton,SignedOut,SignInButton, SignedIn} from "@clerk/nextjs"
const page = () => {
  return (
    <div>
<SignedOut>
  <SignInButton/>

</SignedOut>
<SignedIn>

  <SignOutButton/>
</SignedIn>

        
    </div>
  )
  
}

export default page
