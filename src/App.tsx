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
    <div className="flex flex-row items-center justify-center mb-[45px] w-full">
      <span className="text-[#000000] text-[32px] font-bold tracking-[-0.5px]">SansCounts</span>
      <img
        src="https://i.postimg.cc/VNh8VWCf/Image.jpg"
        alt="SansCounts Logo"
        className="w-[50px] h-[38px] ml-[10px] object-contain"
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
        backgroundColor: disabled ? "#E5E7EB" : "#0099FF",
        color: disabled ? "#9CA3AF" : "#FFFFFF",
      }}
      className="w-full h-[50px] rounded-[25px] flex justify-center items-center mt-[15px] font-bold text-[17px] tracking-[0.3px] transition-colors cursor-pointer"
    >
      {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex justify-center items-center px-[24px]">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {page === 1 && (
          <div className="w-full flex flex-col items-center">
            <LogoHeader />
            <h1 className="text-[#000000] text-[26px] font-bold text-center mb-[35px] tracking-[-0.5px]">
              What's your name?
            </h1>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-[52px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] text-[#000000] text-[17px] mb-[20px] focus:outline-none focus:border-[#0099FF]"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-[52px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] text-[#000000] text-[17px] mb-[20px] focus:outline-none focus:border-[#0099FF]"
            />
            <PrimaryButton
              title="Continue"
              disabled={!isPage1Valid}
              onPress={() => setPage(2)}
            />
            <div className="flex flex-row items-center justify-center mt-[28px]">
              <span className="text-[#6B7280] text-[15px]">Already Have a SansCount?</span>
              <button
                type="button"
                onClick={() => { setPage(7); setLoginError(""); }}
                className="text-[#0099FF] text-[15px] font-bold ml-[6px] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        )}

        {page === 2 && (
          <div className="w-full flex flex-col items-center">
            <LogoHeader />
            <h1 className="text-[#000000] text-[26px] font-bold text-center mb-[10px] tracking-[-0.5px]">
              Birthdate
            </h1>
            <p className="text-[#6B7280] text-[16px] text-center mb-[24px]">
              You must be at least 13 years old.
            </p>
            <div className="w-full flex flex-row gap-[12px] mb-[20px]">
              <button
                type="button"
                onClick={() => setPicker("day")}
                className="flex-1 h-[50px] flex justify-center items-center text-[#000000] text-[16px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] cursor-pointer"
              >
                {day ?? "Day"}
              </button>
              <button
                type="button"
                onClick={() => setPicker("month")}
                className="flex-1 h-[50px] flex justify-center items-center text-[#000000] text-[16px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] cursor-pointer"
              >
                {month ?? "Month"}
              </button>
              <button
                type="button"
                onClick={() => setPicker("year")}
                className="flex-[1.2] h-[50px] flex justify-center items-center text-[#000000] text-[16px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] cursor-pointer"
              >
                {year ?? "Year"}
              </button>
            </div>
            {age !== null && (
              <p className={`text-[16px] mb-[12px] ${!isOldEnough ? "text-[#EF4444]" : "text-[#6B7280]"}`}>
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
              className="mt-[20px] bg-transparent border-0 text-[#6B7280] text-[16px] hover:underline cursor-pointer"
            >
              Back
            </button>

            {picker !== null && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center px-[20px] z-50">
                <div className="w-full max-w-[420px] bg-[#FFFFFF] border-[1.5px] border-[#D1D5DB] rounded-[16px] p-[24px] max-h-[65%] flex flex-col shadow-2xl">
                  <h3 className="text-[#000000] text-[20px] font-bold text-center mb-[20px]">
                    Select {picker === "day" ? "Day" : picker === "month" ? "Month" : "Year"}
                  </h3>
                  <div className="overflow-y-auto mb-[16px] flex-1">
                    {picker === "day" &&
                      Array.from({ length: 31 }, (_, i) => i + 1).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setDay(item);
                            setPicker(null);
                          }}
                          className="w-full h-[50px] flex justify-center items-center border-b border-[#E5E7EB] text-[#000000] text-[16px] hover:bg-[#F3F4F6] cursor-pointer bg-transparent"
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
                          className="w-full h-[50px] flex justify-center items-center border-b border-[#E5E7EB] text-[#000000] text-[16px] hover:bg-[#F3F4F6] cursor-pointer bg-transparent"
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
                          className="w-full h-[50px] flex justify-center items-center border-b border-[#E5E7EB] text-[#000000] text-[16px] hover:bg-[#F3F4F6] cursor-pointer bg-transparent"
                        >
                          {item}
                        </button>
                      ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPicker(null)}
                    className="w-full h-[48px] bg-[#F3F4F6] rounded-[12px] text-[#000000] text-[15px] font-semibold hover:bg-gray-200 cursor-pointer border-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {page === 3 && (
          <div className="w-full flex flex-col items-center">
            <LogoHeader />
            <h1 className="text-[#000000] text-[26px] font-bold text-center mb-[35px] tracking-[-0.5px]">
              Create your username
            </h1>
            <div className="w-full h-[52px] flex flex-row items-center bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] mb-[20px] focus-within:border-[#0099FF]">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 bg-transparent text-[#000000] text-[17px] focus:outline-none"
              />
              <span className="text-[#6B7280] text-[15px] mr-[4px]">@sanscounts.san</span>
            </div>
            <PrimaryButton
              title="Continue"
              disabled={!isPage3Valid}
              onPress={() => setPage(4)}
            />
            <button
              type="button"
              onClick={() => setPage(2)}
              className="mt-[20px] bg-transparent border-0 text-[#6B7280] text-[16px] hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
        )}

        {page === 4 && (
          <div className="w-full flex flex-col items-center">
            <LogoHeader />
            <h1 className="text-[#000000] text-[26px] font-bold text-center mb-[35px] tracking-[-0.5px]">
              Create your Sassword
            </h1>
            <input
              type="password"
              placeholder="Sassword"
              value={sassword}
              onChange={(e) => setSassword(e.target.value)}
              className="w-full h-[52px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] text-[#000000] text-[17px] mb-[20px] focus:outline-none focus:border-[#0099FF]"
            />
            <PrimaryButton
              title="Continue"
              disabled={!isPage4Valid}
              onPress={() => setPage(5)}
            />
            <button
              type="button"
              onClick={() => setPage(3)}
              className="mt-[20px] bg-transparent border-0 text-[#6B7280] text-[16px] hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
        )}

        {page === 5 && (
          <div className="w-full flex flex-col items-center">
            <LogoHeader />
            <h1 className="text-[#000000] text-[26px] font-bold text-center mb-[35px] tracking-[-0.5px]">
              Agreement
            </h1>
            <p className="text-[#6B7280] text-[15px] text-center leading-[24px] mb-[24px]">
              Please review and agree to the SansCounts Terms & Conditions before creating your account.
            </p>

            {signUpError !== "" && (
              <p className="text-[#EF4444] mb-[16px] text-center font-semibold text-[15px]">
                {signUpError}
              </p>
            )}

            <button
              type="button"
              onClick={() => setAgreed(!agreed)}
              className="w-full flex flex-row items-center mb-[24px] text-left cursor-pointer bg-transparent border-0 p-0"
            >
              <div
                style={{
                  backgroundColor: agreed ? "#0099FF" : "#FFFFFF",
                  borderColor: agreed ? "#0099FF" : "#000000",
                }}
                className="w-[22px] h-[22px] border-[1.5px] rounded-[6px] flex justify-center items-center mr-[12px] transition-colors"
              >
                {agreed && <span className="text-[#FFFFFF] text-[14px] font-bold">✓</span>}
              </div>
              <span className="flex-1 text-[#6B7280] text-[15px]">
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
              className="mt-[20px] bg-transparent border-0 text-[#6B7280] text-[16px] hover:underline cursor-pointer"
            >
              Back
            </button>
          </div>
        )}

        {page === 6 && (
          <div className="w-full flex flex-col items-center">
            <div className="w-[60px] h-[60px] rounded-[30px] border-[1.5px] border-[#0099FF] bg-[#F3F4F6] flex justify-center items-center mb-[24px]">
              <span className="text-[#0099FF] text-[28px] font-bold">✓</span>
            </div>
            <LogoHeader />
            <h1 className="text-[#000000] text-[28px] font-bold mb-[12px] tracking-[-0.5px]">Success!</h1>
            <p className="text-[#6B7280] text-[16px] text-center leading-[24px] mb-[20px]">
              Your SansCounts account has been created successfully.
            </p>
            <p className="text-[#000000] text-[16px] font-semibold mb-[24px]">
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
          <div className="w-full flex flex-col items-center">
            <LogoHeader />

            <div className="w-full h-[52px] flex flex-row items-center bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] mb-[20px] focus-within:border-[#0099FF]">
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className="flex-1 bg-transparent text-[#000000] text-[17px] focus:outline-none"
              />
              <span className="text-[#6B7280] text-[15px] mr-[4px]">@sanscounts.san</span>
            </div>

            <input
              type="password"
              placeholder="Sassword"
              value={loginSassword}
              onChange={(e) => setLoginSassword(e.target.value)}
              className="w-full h-[52px] bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] px-[16px] text-[#000000] text-[17px] mb-[15px] focus:outline-none focus:border-[#0099FF]"
            />

            <button type="button" className="text-[#000000] text-[15px] font-medium mb-[24px] hover:underline bg-transparent border-0 cursor-pointer">
              Forgot Sassword ?
            </button>

            {loginError !== "" && (
              <p className="text-[#EF4444] mb-[16px] text-center font-semibold text-[15px]">
                {loginError}
              </p>
            )}

            <PrimaryButton
              title="Continue"
              disabled={!isPage7Valid}
              onPress={handleSignIn}
            />

            <div className="flex flex-row items-center justify-center mt-[28px]">
              <span className="text-[#6B7280] text-[15px]">Don't Have an Account?</span>
              <button
                type="button"
                onClick={() => { setPage(1); setLoginError(""); }}
                className="text-[#0099FF] text-[15px] font-bold ml-[6px] hover:underline cursor-pointer"
              >
                Sign UP
              </button>
            </div>
          </div>
        )}

        {page === 8 && (
          <div className="w-full flex flex-col items-center">
            <div className="w-[60px] h-[60px] rounded-[30px] border-[1.5px] border-[#0099FF] bg-[#F3F4F6] flex justify-center items-center mb-[24px]">
              <span className="text-[#0099FF] text-[28px] font-bold">✓</span>
            </div>
            <LogoHeader />
            <h1 className="text-[#000000] text-[28px] font-bold mb-[12px] tracking-[-0.5px]">Welcome!</h1>
            <p className="text-[#6B7280] text-[16px] text-center leading-[24px] mb-[20px]">
              You have successfully signed in.
            </p>
            <p className="text-[#000000] text-[16px] font-semibold mb-[24px]">
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
