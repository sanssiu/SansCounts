import React, { useState } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function App() {
  const [page, setPage] = useState<number>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const [picker, setPicker] = useState<"day" | "month" | "year" | null>(null);

  const [username, setUsername] = useState("");
  const [sassword, setSassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginSassword, setLoginSassword] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [loginError, setLoginError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [successUsername, setSuccessUsername] = useState("");

  // Developer Auth Portal state
  const [appName, setAppName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [registeredApp, setRegisteredApp] = useState<{ clientId: string; clientSecret: string; appName: string; redirectUri: string } | null>(null);
  const [devPortalTab, setDevPortalTab] = useState<"dashboard" | "sdk">("dashboard");

  const isPage1Valid = firstName.trim() !== "" && lastName.trim() !== "";
  const isPage3Valid = username.trim() !== "";
  const isPage4Valid = sassword.trim() !== "";
  const isLoginUsernameValid = loginUsername.trim() !== "";
  const isLoginSasswordValid = loginSassword.trim() !== "";

  const calculateAge = () => {
    if (day === null || month === null || year === null) return null;
    const monthIndex = MONTH_NAMES.indexOf(month) + 1;
    const today = new Date();
    let calculatedAge = today.getFullYear() - year;
    const currentMonth = today.getMonth() + 1;
    if (currentMonth < monthIndex || (currentMonth === monthIndex && today.getDate() < day)) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const age = calculateAge();
  const isOldEnough = age !== null && age >= 13;

  const handleSignUp = async () => {
    try {
      setSignUpError("");
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          username: username.trim().toLowerCase(),
          password: sassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessUsername(username.trim().toLowerCase());
        setPage(6);
      } else {
        setSignUpError(data.message || "Error during sign-up");
      }
    } catch (error: any) {
      setSignUpError("Backend connection error during sign-up");
    }
  };

  const handleCheckUsername = async () => {
    try {
      setLoginError("");
      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim().toLowerCase(),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setLoginStep(2);
      } else {
        setLoginError(data.message || "Sanscount doesn't exist!");
      }
    } catch (error: any) {
      setLoginError("Sanscount doesn't exist!");
    }
  };

  const handleSignIn = async () => {
    try {
      setLoginError("");
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername.trim().toLowerCase(),
          password: loginSassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessUsername(loginUsername.trim().toLowerCase());
        setPage(8);
      } else {
        setLoginError(data.message || "Sanscount doesn't exist!");
      }
    } catch (error: any) {
      setLoginError("Sanscount doesn't exist!");
    }
  };

  const handleRegisterApp = async () => {
    try {
      const response = await fetch("/api/oauth/register-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appName,
          redirectUri,
          owner: successUsername,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setRegisteredApp(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSignOut = () => {
    setPage(7);
    setLoginStep(1);
    setLoginUsername("");
    setLoginSassword("");
    setLoginError("");
    setRegisteredApp(null);
  };

  const LogoHeader = () => (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '35px', width: '100%' }}>
      <span style={{ color: '#000000', fontSize: '32px', fontWeight: 700, letterSpacing: '-0.5px' }}>SansCounts</span>
      <img
        src="https://i.postimg.cc/2LCNWvH7/Image.jpg"
        alt="SansCounts Logo"
        style={{ width: '42px', height: '42px', objectFit: 'contain', marginLeft: '10px' }}
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/logo.jpg';
        }}
      />
    </div>
  );

  const PrimaryButton = ({
    title,
    onPress,
    disabled = false,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onPress}
      style={{
        width: '100%',
        height: '50px',
        borderRadius: '25px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '15px',
        backgroundColor: disabled ? '#E5E7EB' : '#0099FF',
        color: disabled ? '#9CA3AF' : '#FFFFFF',
        fontSize: '17px',
        fontWeight: 700,
        letterSpacing: '0.3px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 12px rgba(0, 153, 255, 0.25)'
      }}
    >
      {title}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: page === 8 ? '560px' : '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {page === 1 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '35px', letterSpacing: '-0.5px', margin: '0 0 35px 0' }}>
              What's your name?
            </h1>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => setFocusedField('firstName')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: focusedField === 'firstName' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#000000',
                fontSize: '17px',
                marginBottom: '20px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => setFocusedField('lastName')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: focusedField === 'lastName' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#000000',
                fontSize: '17px',
                marginBottom: '20px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <PrimaryButton
              title="Continue"
              disabled={!isPage1Valid}
              onPress={() => setPage(2)}
            />
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: '28px' }}>
              <span style={{ color: '#6B7280', fontSize: '15px' }}>Already Have a SansCount?</span>
              <button
                type="button"
                onClick={() => { setPage(7); setLoginStep(1); setLoginError(""); }}
                style={{ color: '#0099FF', fontSize: '15px', fontWeight: 700, marginLeft: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {page === 2 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '10px', letterSpacing: '-0.5px', margin: '0 0 10px 0' }}>
              Birthdate
            </h1>
            <p style={{ color: '#6B7280', fontSize: '16px', textAlign: 'center', marginBottom: '24px', margin: '0 0 24px 0' }}>
              You must be at least 13 years old.
            </p>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'row', gap: '12px', marginBottom: '20px' }}>
              <button
                type="button"
                onClick={() => setPicker("day")}
                style={{
                  flex: 1,
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#000000',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {day ?? "Day"}
              </button>
              <button
                type="button"
                onClick={() => setPicker("month")}
                style={{
                  flex: 1,
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#000000',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {month ?? "Month"}
              </button>
              <button
                type="button"
                onClick={() => setPicker("year")}
                style={{
                  flex: 1.2,
                  height: '50px',
                  backgroundColor: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#000000',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                {year ?? "Year"}
              </button>
            </div>
            {age !== null && (
              <p style={{ fontSize: '16px', marginBottom: '12px', color: !isOldEnough ? '#EF4444' : '#6B7280', margin: '0 0 12px 0' }}>
                Age: {age} {!isOldEnough && " — Must be 13+"}
              </p>
            )}
            <PrimaryButton
              title="Continue"
              disabled={!isOldEnough}
              onPress={() => setPage(3)}
            />
            <button
              type="button"
              onClick={() => setPage(1)}
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6B7280', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>

            {picker !== null && (
              <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 50 }}>
                <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', border: '1.5px solid #D1D5DB', borderRadius: '16px', padding: '24px', maxHeight: '65%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                  <h3 style={{ color: '#000000', fontSize: '20px', fontWeight: 700, textAlign: 'center', marginBottom: '20px', margin: '0 0 20px 0' }}>
                    Select {picker === "day" ? "Day" : picker === "month" ? "Month" : "Year"}
                  </h3>
                  <div style={{ overflowY: 'auto', marginBottom: '16px', flex: 1 }}>
                    {picker === "day" &&
                      Array.from({ length: 31 }, (_, i) => i + 1).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setDay(item);
                            setPicker(null);
                          }}
                          style={{
                            width: '100%',
                            height: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottom: '1px solid #E5E7EB',
                            color: '#000000',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    {picker === "month" &&
                      MONTH_NAMES.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setMonth(item);
                            setPicker(null);
                          }}
                          style={{
                            width: '100%',
                            height: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottom: '1px solid #E5E7EB',
                            color: '#000000',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    {picker === "year" &&
                      Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setYear(item);
                            setPicker(null);
                          }}
                          style={{
                            width: '100%',
                            height: '50px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderBottom: '1px solid #E5E7EB',
                            color: '#000000',
                            fontSize: '16px',
                            backgroundColor: 'transparent',
                            borderTop: 'none',
                            borderLeft: 'none',
                            borderRight: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {item}
                        </button>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPicker(null)}
                    style={{
                      width: '100%',
                      height: '48px',
                      backgroundColor: '#F3F4F6',
                      borderRadius: '12px',
                      color: '#000000',
                      fontSize: '15px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 3 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '35px', letterSpacing: '-0.5px', margin: '0 0 35px 0' }}>
              Create your username
            </h1>
            <div style={{
              width: '100%',
              height: '52px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: focusedField === 'username' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#000000',
                  fontSize: '17px',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#6B7280', fontSize: '15px', marginRight: '4px' }}>@sanscounts.san</span>
            </div>
            <PrimaryButton
              title="Continue"
              disabled={!isPage3Valid}
              onPress={() => setPage(4)}
            />
            <button
              type="button"
              onClick={() => setPage(2)}
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6B7280', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        )}

        {page === 4 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '35px', letterSpacing: '-0.5px', margin: '0 0 35px 0' }}>
              Create your Sassword
            </h1>
            <input
              type="password"
              placeholder="Sassword"
              value={sassword}
              onChange={(e) => setSassword(e.target.value)}
              onFocus={() => setFocusedField('sassword')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: focusedField === 'sassword' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#000000',
                fontSize: '17px',
                marginBottom: '20px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <PrimaryButton
              title="Continue"
              disabled={!isPage4Valid}
              onPress={() => setPage(5)}
            />
            <button
              type="button"
              onClick={() => setPage(3)}
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6B7280', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        )}

        {page === 5 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '35px', letterSpacing: '-0.5px', margin: '0 0 35px 0' }}>
              Agreement
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px', textAlign: 'center', lineHeight: '24px', marginBottom: '24px', margin: '0 0 24px 0' }}>
              Please review and agree to the SansCounts Terms & Conditions before creating your account.
            </p>

            {signUpError !== "" && (
              <p style={{ color: '#EF4444', marginBottom: '16px', textAlign: 'center', fontWeight: 600, fontSize: '15px', margin: '0 0 16px 0' }}>
                {signUpError}
              </p>
            )}

            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: '24px',
                textAlign: 'left',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0
              }}
            >
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  border: '1.5px solid',
                  borderColor: agreed ? '#0099FF' : '#000000',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: '12px',
                  backgroundColor: agreed ? '#0099FF' : '#FFFFFF',
                  transition: 'background-color 0.2s'
                }}
              >
                {agreed && <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ flex: 1, color: '#6B7280', fontSize: '15px' }}>
                I agree to the SansCounts Terms & Conditions
              </span>
            </button>
            <PrimaryButton
              title="Create Account"
              disabled={!agreed}
              onPress={handleSignUp}
            />
            <button
              type="button"
              onClick={() => setPage(4)}
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6B7280', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        )}

        {page === 6 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1.5px solid #0099FF', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ color: '#0099FF', fontSize: '28px', fontWeight: 700 }}>✓</span>
            </div>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '28px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>Success!</h1>
            <p style={{ color: '#6B7280', fontSize: '16px', textAlign: 'center', lineHeight: '24px', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Your SansCounts account has been created successfully.
            </p>
            <p style={{ color: '#000000', fontSize: '16px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              {successUsername}@sanscounts.san
            </p>
            <PrimaryButton
              title="Done"
              onPress={() => {
                setPage(1);
                setFirstName("");
                setLastName("");
                setDay(null);
                setMonth(null);
                setYear(null);
                setUsername("");
                setSassword("");
                setAgreed(false);
                setSignUpError("");
              }}
            />
          </div>
        )}

        {page === 7 && loginStep === 1 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '35px', letterSpacing: '-0.5px', margin: '0 0 35px 0' }}>
              Sign In
            </h1>
            <div style={{
              width: '100%',
              height: '52px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: focusedField === 'loginUsername' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
              borderRadius: '12px',
              padding: '0 16px',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}>
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                onFocus={() => setFocusedField('loginUsername')}
                onBlur={() => setFocusedField(null)}
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#000000',
                  fontSize: '17px',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#6B7280', fontSize: '15px', marginRight: '4px' }}>@sanscounts.san</span>
            </div>

            {loginError !== "" && (
              <p style={{ color: '#EF4444', marginBottom: '16px', textAlign: 'center', fontWeight: 600, fontSize: '15px', margin: '0 0 16px 0' }}>
                {loginError}
              </p>
            )}

            <PrimaryButton
              title="Continue"
              disabled={!isLoginUsernameValid}
              onPress={handleCheckUsername}
            />

            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: '28px' }}>
              <span style={{ color: '#6B7280', fontSize: '15px' }}>Don't Have an Account?</span>
              <button
                type="button"
                onClick={() => { setPage(1); setLoginError(""); }}
                style={{ color: '#0099FF', fontSize: '15px', fontWeight: 700, marginLeft: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                Sign UP
              </button>
            </div>
          </div>
        )}

        {page === 7 && loginStep === 2 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, textAlign: 'center', marginBottom: '10px', letterSpacing: '-0.5px', margin: '0 0 10px 0' }}>
              Enter Sassword
            </h1>
            <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '35px', margin: '0 0 35px 0' }}>
              {loginUsername}@sanscounts.san
            </p>

            <input
              type="password"
              placeholder="Sassword"
              value={loginSassword}
              onChange={(e) => setLoginSassword(e.target.value)}
              onFocus={() => setFocusedField('loginSassword')}
              onBlur={() => setFocusedField(null)}
              style={{
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: focusedField === 'loginSassword' ? '1.5px solid #0099FF' : '1.5px solid #D1D5DB',
                borderRadius: '12px',
                padding: '0 16px',
                color: '#000000',
                fontSize: '17px',
                marginBottom: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            <button type="button" style={{ color: '#000000', fontSize: '15px', fontWeight: 500, marginBottom: '24px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Forgot Sassword ?
            </button>

            {loginError !== "" && (
              <p style={{ color: '#EF4444', marginBottom: '16px', textAlign: 'center', fontWeight: 600, fontSize: '15px', margin: '0 0 16px 0' }}>
                {loginError}
              </p>
            )}

            <PrimaryButton
              title="Sign In"
              disabled={!isLoginSasswordValid}
              onPress={handleSignIn}
            />

            <button
              type="button"
              onClick={() => { setLoginStep(1); setLoginSassword(""); setLoginError(""); }}
              style={{ marginTop: '20px', background: 'none', border: 'none', color: '#6B7280', fontSize: '16px', cursor: 'pointer' }}
            >
              Back
            </button>
          </div>
        )}

        {page === 8 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1.5px solid #0099FF', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#0099FF', fontSize: '28px', fontWeight: 700 }}>✓</span>
            </div>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px', margin: '0 0 8px 0' }}>Welcome, {successUsername}!</h1>
            <p style={{ color: '#6B7280', fontSize: '15px', textAlign: 'center', marginBottom: '20px', margin: '0 0 20px 0' }}>
              Signed in with SansCounts Auth.
            </p>

            {/* Developer Auth Portal Section */}
            <div style={{ width: '100%', backgroundColor: '#F9FAFB', border: '1.5px solid #E5E7EB', borderRadius: '16px', padding: '20px', boxSizing: 'border-box', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#000000' }}>SansCounts Auth Developer Portal</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("dashboard")}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: devPortalTab === "dashboard" ? '#0099FF' : 'transparent',
                      color: devPortalTab === "dashboard" ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    My Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("sdk")}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: devPortalTab === "sdk" ? '#0099FF' : 'transparent',
                      color: devPortalTab === "sdk" ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    SDK Docs
                  </button>
                </div>
              </div>

              {devPortalTab === "dashboard" && (
                <div>
                  <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '14px', lineHeight: '20px', margin: '0 0 14px 0' }}>
                    Register your website or app to integrate <b>"Sign in with SansCounts"</b> for your users.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                    <input
                      type="text"
                      placeholder="App Name (e.g. My Awesome Site)"
                      value={appName}
                      onChange={(e) => setAppName(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', outline: 'none' }}
                    />
                    <input
                      type="text"
                      placeholder="Redirect URI (e.g. https://myapp.com/callback)"
                      value={redirectUri}
                      onChange={(e) => setRedirectUri(e.target.value)}
                      style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', outline: 'none' }}
                    />
                    <button
                      type="button"
                      disabled={!appName.trim() || !redirectUri.trim()}
                      onClick={handleRegisterApp}
                      style={{
                        width: '100%',
                        height: '40px',
                        backgroundColor: (!appName.trim() || !redirectUri.trim()) ? '#E5E7EB' : '#0099FF',
                        color: (!appName.trim() || !redirectUri.trim()) ? '#9CA3AF' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Register App & Get API Credentials
                    </button>
                  </div>

                  {registeredApp && (
                    <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #0099FF', borderRadius: '10px', padding: '14px' }}>
                      <p style={{ fontWeight: 700, fontSize: '14px', color: '#0099FF', marginBottom: '6px', margin: '0 0 6px 0' }}>App Registered Successfully!</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}><b>Client ID:</b> <code>{registeredApp.clientId}</code></p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}><b>Client Secret:</b> <code>{registeredApp.clientSecret}</code></p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0' }}><b>Redirect URI:</b> <code>{registeredApp.redirectUri}</code></p>
                    </div>
                  )}
                </div>
              )}

              {devPortalTab === "sdk" && (
                <div>
                  <p style={{ fontSize: '14px', color: '#4B5563', marginBottom: '10px', fontWeight: 600, margin: '0 0 10px 0' }}>
                    Integrate "Sign in with SansCounts" in your App:
                  </p>
                  <pre style={{ backgroundColor: '#1F2937', color: '#E5E7EB', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', textAlign: 'left', margin: 0 }}>
{`<!-- HTML Button Snippet -->
<a href="https://sanscounts.sanssiu.com/auth/login?client_id=YOUR_CLIENT_ID"
   style="background: #0099FF; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
   Sign in with SansCounts
</a>`}
                  </pre>
                </div>
              )}
            </div>

            <PrimaryButton
              title="Sign Out"
              onPress={handleSignOut}
            />
          </div>
        )}
      </div>
    </div>
  );
}
