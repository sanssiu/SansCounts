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

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [loginError, setLoginError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [successUsername, setSuccessUsername] = useState("");

  const isPage1Valid = firstName.trim() !== "" && lastName.trim() !== "";
  const isPage3Valid = username.trim() !== "";
  const isPage4Valid = sassword.trim() !== "";
  const isPage7Valid = loginUsername.trim() !== "" && loginSassword.trim() !== "";

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

  const handleSignOut = () => {
    setPage(7);
    setLoginUsername("");
    setLoginSassword("");
    setLoginError("");
  };

  const LogoHeader = () => (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: '45px', width: '100%' }}>
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
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                onClick={() => { setPage(7); setLoginError(""); }}
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

        {page === 7 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <LogoHeader />

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
              title="Continue"
              disabled={!isPage7Valid}
              onPress={handleSignIn}
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

        {page === 8 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1.5px solid #0099FF', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ color: '#0099FF', fontSize: '28px', fontWeight: 700 }}>✓</span>
            </div>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '28px', fontWeight: 700, marginBottom: '12px', letterSpacing: '-0.5px', margin: '0 0 12px 0' }}>Welcome!</h1>
            <p style={{ color: '#6B7280', fontSize: '16px', textAlign: 'center', lineHeight: '24px', marginBottom: '20px', margin: '0 0 20px 0' }}>
              You have successfully signed in.
            </p>
            <p style={{ color: '#000000', fontSize: '16px', fontWeight: 600, marginBottom: '24px', margin: '0 0 24px 0' }}>
              {successUsername}@sanscounts.san
            </p>
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
