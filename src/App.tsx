import React, { useState, useEffect } from "react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// Helper to normalize usernames and strip domain suffixes if typed
const normalizeUsername = (val: string) => {
  return val
    .trim()
    .toLowerCase()
    .replace(/@sanscounts\.san$/i, '')
    .replace(/@.*$/i, '');
};

interface AppRecord {
  clientId: string;
  clientSecret: string;
  appName: string;
  redirectUri: string;
  owner: string;
  createdAt: string;
}

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
  const [registeredApps, setRegisteredApps] = useState<AppRecord[]>([]);
  const [appName, setAppName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [devPortalTab, setDevPortalTab] = useState<"apps" | "liveTest" | "sdk">("apps");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live OAuth Consent Modal state
  const [oauthDialog, setOauthDialog] = useState<{
    isOpen: boolean;
    clientId: string;
    appName: string;
    redirectUri: string;
  } | null>(null);
  const [oauthSuccessInfo, setOauthSuccessInfo] = useState<{
    code: string;
    redirectUri: string;
    tokenResult?: any;
    userResult?: any;
  } | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Fetch apps & check URL params on startup
  useEffect(() => {
    fetch("/api/oauth/apps")
      .then((res) => res.json())
      .then((data: AppRecord[]) => {
        if (Array.isArray(data)) {
          setRegisteredApps(data);
        }
      })
      .catch((err) => console.warn("Error fetching apps:", err));

    // Handle OAuth query parameters if opened by external client
    const params = new URLSearchParams(window.location.search);
    const clientIdParam = params.get("client_id");
    const redirectParam = params.get("redirect_uri");

    if (clientIdParam) {
      fetch(`/api/oauth/authorize?client_id=${clientIdParam}`)
        .then((res) => res.json())
        .then((info) => {
          if (info.appName) {
            setOauthDialog({
              isOpen: true,
              clientId: info.clientId,
              appName: info.appName,
              redirectUri: redirectParam || info.redirectUri,
            });
          }
        })
        .catch(() => {});
    }
  }, []);

  const refreshApps = () => {
    fetch("/api/oauth/apps")
      .then((res) => res.json())
      .then((data: AppRecord[]) => {
        if (Array.isArray(data)) {
          setRegisteredApps(data);
        }
      })
      .catch(() => {});
  };

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
      const cleanUser = normalizeUsername(username);
      if (!cleanUser) {
        setSignUpError("Please enter a valid username");
        return;
      }

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: cleanUser,
          password: sassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessUsername(cleanUser);
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
      const cleanUser = normalizeUsername(loginUsername);
      if (!cleanUser) {
        setLoginError("Please enter a username");
        return;
      }

      const response = await fetch("/api/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setLoginUsername(cleanUser);
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
      const cleanUser = normalizeUsername(loginUsername);

      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUser,
          password: loginSassword,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessUsername(cleanUser);
        setPage(8);
        refreshApps();
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
          owner: successUsername || "sanscounts@gmail.com",
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setAppName("");
        setRedirectUri("");
        refreshApps();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthorizeOauth = async () => {
    if (!oauthDialog) return;
    setIsAuthorizing(true);
    try {
      const activeUser = successUsername || "sans";
      const response = await fetch("/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: oauthDialog.clientId,
          redirect_uri: oauthDialog.redirectUri,
          username: activeUser,
        }),
      });
      const authResult = await response.json();
      if (response.ok) {
        // Automatically simulate live real-time token exchange to verify end-to-end
        const matchingApp = registeredApps.find((a) => a.clientId === oauthDialog.clientId);
        const secret = matchingApp?.clientSecret || "sc_sec_sansneat_82f1b702e9a1c4";

        const tokenRes = await fetch("/api/oauth/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: oauthDialog.clientId,
            client_secret: secret,
            code: authResult.code,
          }),
        });
        const tokenData = await tokenRes.json();

        let userInfo = null;
        if (tokenData.access_token) {
          const userRes = await fetch("/api/oauth/userinfo", {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          });
          userInfo = await userRes.json();
        }

        setOauthSuccessInfo({
          code: authResult.code,
          redirectUri: authResult.redirectUri,
          tokenResult: tokenData,
          userResult: userInfo,
        });

        // If in an actual popup window with opener, broadcast postMessage
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "SANSCOUNTS_AUTH_SUCCESS",
              code: authResult.code,
              redirectUri: authResult.redirectUri,
            },
            "*"
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSignOut = () => {
    setPage(7);
    setLoginStep(1);
    setLoginUsername("");
    setLoginSassword("");
    setLoginError("");
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
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

  // Find sansneat client
  const sansNeatApp = registeredApps.find(
    (a) => a.clientId === "sc_client_sansneat_live" || a.redirectUri.includes("sansneat")
  ) || {
    clientId: "sc_client_sansneat_live",
    clientSecret: "sc_sec_sansneat_82f1b702e9a1c4",
    appName: "SansNeat",
    redirectUri: "https://sansneat.sanssiu.com/auth/callback",
    owner: "sanscounts@gmail.com",
    createdAt: "2026-10-01",
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: page === 8 ? '620px' : '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <p style={{ color: '#0099FF', fontSize: '18px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px 0' }}>
              {successUsername}@sanscounts.san
            </p>
            <PrimaryButton
              title="Sign In with this Account"
              onPress={() => {
                setLoginUsername(successUsername);
                setLoginStep(2);
                setLoginSassword("");
                setLoginError("");
                setPage(7);
              }}
            />
            <button
              type="button"
              onClick={() => {
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
              style={{ marginTop: '16px', background: 'none', border: 'none', color: '#6B7280', fontSize: '15px', cursor: 'pointer' }}
            >
              Done
            </button>
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
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', border: '1.5px solid #0099FF', backgroundColor: '#F3F4F6', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#0099FF', fontSize: '28px', fontWeight: 700 }}>✓</span>
            </div>
            <LogoHeader />
            <h1 style={{ color: '#000000', fontSize: '26px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>Welcome, {successUsername}!</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '4px', backgroundColor: '#10B981' }}></span>
              <span style={{ color: '#4B5563', fontSize: '14px', fontWeight: 500 }}>
                {successUsername}@sanscounts.san (Active Session)
              </span>
            </div>

            {/* Developer Auth Portal Section */}
            <div style={{ width: '100%', backgroundColor: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: '16px', padding: '22px', boxSizing: 'border-box', marginBottom: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#000000', display: 'block' }}>SansCounts Auth (sAuth) Portal</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>Real-time OAuth 2.0 Provider for Web & Apps</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("apps")}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: devPortalTab === "apps" ? '#0099FF' : '#F3F4F6',
                      color: devPortalTab === "apps" ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Client Apps
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("liveTest")}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: devPortalTab === "liveTest" ? '#0099FF' : '#F3F4F6',
                      color: devPortalTab === "liveTest" ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Live Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevPortalTab("sdk")}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: devPortalTab === "sdk" ? '#0099FF' : '#F3F4F6',
                      color: devPortalTab === "sdk" ? '#FFFFFF' : '#4B5563',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    SDK Snippets
                  </button>
                </div>
              </div>

              {devPortalTab === "apps" && (
                <div>
                  {/* Highlighted Client for sansneat.sanssiu.com */}
                  <div style={{ border: '2px solid #0099FF', borderRadius: '12px', padding: '16px', backgroundColor: '#F0F9FF', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '16px', color: '#0369A1' }}>SansNeat (sansneat.sanssiu.com)</span>
                        <span style={{ fontSize: '11px', backgroundColor: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>LIVE</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOauthDialog({
                            isOpen: true,
                            clientId: sansNeatApp.clientId,
                            appName: sansNeatApp.appName,
                            redirectUri: sansNeatApp.redirectUri,
                          });
                          setOauthSuccessInfo(null);
                        }}
                        style={{
                          backgroundColor: '#0099FF',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ⚡ Test Auth
                      </button>
                    </div>

                    <p style={{ fontSize: '13px', color: '#0C4A6E', marginBottom: '12px' }}>
                      Configured for <b>https://sansneat.sanssiu.com</b>. Third-party developers can immediately use these client keys to sign in users with SansCounts!
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 600 }}>CLIENT ID</span>
                          <code style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>{sansNeatApp.clientId}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sansNeatApp.clientId, 'cid')}
                          style={{ fontSize: '12px', background: 'none', border: 'none', color: copiedKey === 'cid' ? '#10B981' : '#0284C7', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {copiedKey === 'cid' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 600 }}>CLIENT SECRET</span>
                          <code style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>{sansNeatApp.clientSecret}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sansNeatApp.clientSecret, 'sec')}
                          style={{ fontSize: '12px', background: 'none', border: 'none', color: copiedKey === 'sec' ? '#10B981' : '#0284C7', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {copiedKey === 'sec' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '8px', border: '1px solid #BAE6FD' }}>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: 600 }}>REDIRECT URI</span>
                          <code style={{ fontSize: '12px', color: '#0284C7', fontWeight: 600 }}>{sansNeatApp.redirectUri}</code>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(sansNeatApp.redirectUri, 'uri')}
                          style={{ fontSize: '12px', background: 'none', border: 'none', color: copiedKey === 'uri' ? '#10B981' : '#0284C7', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {copiedKey === 'uri' ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Register New App Form */}
                  <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '10px' }}>
                      Register Another Client App
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="App Name (e.g. My Website)"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                      />
                      <input
                        type="text"
                        placeholder="Redirect URI (e.g. https://example.com/callback)"
                        value={redirectUri}
                        onChange={(e) => setRedirectUri(e.target.value)}
                        style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
                      />
                      <button
                        type="button"
                        disabled={!appName.trim() || !redirectUri.trim()}
                        onClick={handleRegisterApp}
                        style={{
                          height: '38px',
                          backgroundColor: (!appName.trim() || !redirectUri.trim()) ? '#E5E7EB' : '#000000',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        + Create Client Credentials
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {devPortalTab === "liveTest" && (
                <div>
                  <p style={{ fontSize: '13px', color: '#4B5563', marginBottom: '14px' }}>
                    Run a live, end-to-end OAuth 2.0 flow for <b>SansNeat</b>. This tests authorization code issuance, token exchange, and UserInfo profile retrieval in real time:
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setOauthDialog({
                        isOpen: true,
                        clientId: sansNeatApp.clientId,
                        appName: sansNeatApp.appName,
                        redirectUri: sansNeatApp.redirectUri,
                      });
                      setOauthSuccessInfo(null);
                    }}
                    style={{
                      width: '100%',
                      height: '42px',
                      backgroundColor: '#0099FF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                  >
                    Open Live SansCounts Consent Screen for SansNeat
                  </button>

                  {oauthSuccessInfo && (
                    <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #10B981', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <span style={{ color: '#10B981', fontWeight: 700 }}>✓</span>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#065F46' }}>Real-Time OAuth Completed Successfully!</span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0' }}>
                        <b>Auth Code:</b> <code style={{ color: '#0284C7' }}>{oauthSuccessInfo.code}</code>
                      </p>
                      <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0' }}>
                        <b>Access Token:</b> <code style={{ color: '#0284C7' }}>{oauthSuccessInfo.tokenResult?.access_token?.substring(0, 24)}...</code>
                      </p>
                      <p style={{ fontSize: '12px', color: '#334155', margin: '4px 0' }}>
                        <b>Verified Profile:</b> <code style={{ color: '#059669' }}>{JSON.stringify(oauthSuccessInfo.userResult)}</code>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {devPortalTab === "sdk" && (
                <div>
                  <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: 600 }}>
                    1. Frontend Button (Add to sansneat.sanssiu.com HTML):
                  </p>
                  <pre style={{ backgroundColor: '#0F172A', color: '#E2E8F0', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', textAlign: 'left', margin: '0 0 16px 0' }}>
{`<!-- Sign in with SansCounts Button -->
<a href="${window.location.origin}/?client_id=sc_client_sansneat_live&redirect_uri=https://sansneat.sanssiu.com/auth/callback"
   style="display:inline-flex;align-items:center;padding:10px 20px;background:#0099FF;color:#fff;border-radius:24px;text-decoration:none;font-weight:bold;font-family:sans-serif;">
  <span style="margin-right:8px;">🔒</span> Sign in with SansCounts
</a>`}
                  </pre>

                  <p style={{ fontSize: '13px', color: '#374151', marginBottom: '8px', fontWeight: 600 }}>
                    2. Backend Token Exchange (Node.js / Express on sansneat.sanssiu.com):
                  </p>
                  <pre style={{ backgroundColor: '#0F172A', color: '#E2E8F0', padding: '12px', borderRadius: '8px', fontSize: '12px', overflowX: 'auto', textAlign: 'left', margin: 0 }}>
{`// Exchange code received in callback for SansCounts user profile
const tokenResponse = await fetch("${window.location.origin}/api/oauth/token", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    client_id: "sc_client_sansneat_live",
    client_secret: "sc_sec_sansneat_82f1b702e9a1c4",
    code: req.query.code
  })
});
const { access_token, user } = await tokenResponse.json();
console.log("Logged in user:", user.username, user.email);`}
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

        {/* Live OAuth Consent Screen Dialog */}
        {oauthDialog?.isOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', zIndex: 100 }}>
            <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
              <LogoHeader />
              <div style={{ width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#E0F2FE', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '26px' }}>🔐</span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#000000', marginBottom: '8px', textAlign: 'center', margin: '0 0 8px 0' }}>
                Sign in to {oauthDialog.appName}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', marginBottom: '20px', margin: '0 0 20px 0' }}>
                <b>{oauthDialog.appName}</b> is requesting permission to verify your identity using SansCounts Auth.
              </p>

              <div style={{ width: '100%', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '18px', backgroundColor: '#0099FF', color: '#FFFFFF', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700 }}>
                  {(successUsername || "S")[0].toUpperCase()}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#000000', display: 'block' }}>
                    {successUsername || "sans"}
                  </span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    {successUsername || "sans"}@sanscounts.san
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', marginBottom: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>PERMISSIONS</span>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span>✓</span> Read your SansCounts username and full name
                </div>
                <div style={{ fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✓</span> Authenticate your session on {oauthDialog.appName}
                </div>
              </div>

              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handleAuthorizeOauth}
                style={{
                  width: '100%',
                  height: '48px',
                  backgroundColor: '#0099FF',
                  color: '#FFFFFF',
                  borderRadius: '24px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '10px'
                }}
              >
                {isAuthorizing ? "Authorizing..." : `Allow & Continue to ${oauthDialog.appName}`}
              </button>

              <button
                type="button"
                onClick={() => setOauthDialog(null)}
                style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
