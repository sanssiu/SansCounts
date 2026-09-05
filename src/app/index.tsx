import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Index() {
  const [page, setPage] = useState(1);

  // =========================
  // SIGN UP
  // =========================

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const [picker, setPicker] = useState<"day" | "month" | "year" | null>(null);

  const [username, setUsername] = useState("");
  const [sassword, setSassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // =========================
  // SIGN IN
  // =========================

  const [loginUsername, setLoginUsername] = useState("");
  const [loginSassword, setLoginSassword] = useState("");

  // =========================
  // VALIDATIONS & LOGIC
  // =========================

  const isPage1Valid = firstName.trim() !== "" && lastName.trim() !== "";
  const isPage3Valid = username.trim() !== "";
  const isPage4Valid = sassword.trim() !== "";
  const isPage7Valid = loginUsername.trim() !== "" && loginSassword.trim() !== "";

  const calculateAge = () => {
    if (day === null || month === null || year === null) return null;

    const today = new Date();
    let calculatedAge = today.getFullYear() - year;
    const currentMonth = today.getMonth() + 1;

    if (
      currentMonth < month ||
      (currentMonth === month && today.getDate() < day)
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  const age = calculateAge();
  const isOldEnough = age !== null && age >= 13;

  // Header Component
  const LogoHeader = () => (
    <View style={styles.logoHeaderContainer}>
      <Text style={styles.logoText}>SansCounts</Text>
      <Image
        source={{ uri: "https://i.postimg.cc/VNh8VWCf/Image.jpg" }}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );

  // Primary Button Component
  const PrimaryButton = ({
    title,
    onPress,
    disabled = false,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: disabled
            ? "#E5E7EB"
            : pressed
            ? "#009ACD"
            : "#00BFFF",
        },
      ]}
    >
      <Text
        style={[
          styles.primaryButtonText,
          { color: disabled ? "#9CA3AF" : "#FFFFFF" },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );

  // ==================================================
  // PAGE 1 — NAME
  // ==================================================

  if (page === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>What's your name?</Text>

          <TextInput
            style={styles.input}
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            value={firstName}
            onChangeText={setFirstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            value={lastName}
            onChangeText={setLastName}
          />

          <PrimaryButton
            title="Continue"
            disabled={!isPage1Valid}
            onPress={() => setPage(2)}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already Have a SansCount?</Text>

            <TouchableOpacity onPress={() => setPage(7)}>
              <Text style={styles.loginButton}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 2 — BIRTHDATE
  // ==================================================

  if (page === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>Birthdate</Text>

          <Text style={styles.subtitle}>
            You must be at least 13 years old.
          </Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dateSelect}
              onPress={() => setPicker("day")}
            >
              <Text style={styles.dateSelectText}>{day ?? "Day"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateSelect}
              onPress={() => setPicker("month")}
            >
              <Text style={styles.dateSelectText}>{month ?? "Month"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateSelectYear}
              onPress={() => setPicker("year")}
            >
              <Text style={styles.dateSelectText}>{year ?? "Year"}</Text>
            </TouchableOpacity>
          </View>

          {age !== null && (
            <Text style={[styles.ageText, !isOldEnough && styles.errorText]}>
              Age: {age}
              {!isOldEnough && " — Must be 13+"}
            </Text>
          )}

          <PrimaryButton
            title="Continue"
            disabled={!isOldEnough}
            onPress={() => setPage(3)}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPage(1)}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        {/* DATE PICKER MODAL */}
        <Modal
          visible={picker !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setPicker(null)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                Select{" "}
                {picker === "day"
                  ? "Day"
                  : picker === "month"
                  ? "Month"
                  : "Year"}
              </Text>

              <ScrollView style={styles.optionsList}>
                {picker === "day" &&
                  Array.from({ length: 31 }, (_, i) => i + 1).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setDay(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}

                {picker === "month" &&
                  Array.from({ length: 12 }, (_, i) => i + 1).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setMonth(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}

                {picker === "year" &&
                  Array.from(
                    { length: 100 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setYear(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPicker(null)}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ==================================================
  // PAGE 3 — USERNAME
  // ==================================================

  if (page === 3) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>Create your username</Text>

          <View style={styles.usernameBox}>
            <TextInput
              style={styles.usernameInput}
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <Text style={styles.domain}>@sanscounts.san</Text>
          </View>

          <PrimaryButton
            title="Continue"
            disabled={!isPage3Valid}
            onPress={() => setPage(4)}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPage(2)}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 4 — SASSWORD
  // ==================================================

  if (page === 4) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>Create your Sassword</Text>

          <TextInput
            style={styles.input}
            placeholder="Sassword"
            placeholderTextColor="#9CA3AF"
            value={sassword}
            onChangeText={setSassword}
            secureTextEntry
          />

          <PrimaryButton
            title="Continue"
            disabled={!isPage4Valid}
            onPress={() => setPage(5)}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPage(3)}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 5 — AGREEMENT
  // ==================================================

  if (page === 5) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>Agreement</Text>

          <Text style={styles.agreementText}>
            Please review and agree to the SansCounts Terms & Conditions before
            creating your account.
          </Text>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreed(!agreed)}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
              {agreed && <Text style={styles.checkmark}>✓</Text>}
            </View>

            <Text style={styles.checkboxText}>
              I agree to the SansCounts Terms & Conditions
            </Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Create Account"
            disabled={!agreed}
            onPress={() => setPage(6)}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setPage(4)}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 6 — SUCCESS
  // ==================================================

  if (page === 6) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.successCircle}>
            <Text style={styles.checkmarkLarge}>✓</Text>
          </View>

          <LogoHeader />

          <Text style={styles.successTitle}>Success!</Text>

          <Text style={styles.successText}>
            Your SansCounts account has been created successfully.
          </Text>

          <Text style={styles.usernamePreview}>{username}@sanscounts.san</Text>

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
            }}
          />
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 7 — SIGN IN
  // ==================================================

  if (page === 7) {
    return (
      <View style={styles.container}>
        <View style={styles.formContainer}>
          <LogoHeader />

          <Text style={styles.title}>Welcome Back</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#9CA3AF"
            value={loginUsername}
            onChangeText={setLoginUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Sansword"
            placeholderTextColor="#9CA3AF"
            value={loginSassword}
            onChangeText={setLoginSassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.sansgotText}>Sansnot Sassword?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Sign In"
            disabled={!isPage7Valid}
            onPress={() => setPage(8)}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Don't Have a SansCount?</Text>

            <TouchableOpacity onPress={() => setPage(1)}>
              <Text style={styles.loginButton}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==================================================
  // PAGE 8 — SIGN IN SUCCESS
  // ==================================================

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <View style={styles.successCircle}>
          <Text style={styles.checkmarkLarge}>✓</Text>
        </View>

        <LogoHeader />

        <Text style={styles.successTitle}>Welcome!</Text>

        <Text style={styles.successText}>You have successfully signed in.</Text>

        <Text style={styles.usernamePreview}>{loginUsername}</Text>

        <PrimaryButton
          title="Sign Out"
          onPress={() => {
            setPage(7);
            setLoginUsername("");
            setLoginSassword("");
          }}
        />
      </View>
    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  formContainer: {
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
  },

  logoHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },

  logoImage: {
    width: 60,
    height: 60,
    marginLeft: 12,
  },

  logoText: {
    color: "#000000",
    fontSize: 34,
    fontWeight: "600",
    letterSpacing: -0.5,
  },

  title: {
    color: "#000000",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 32,
    letterSpacing: -0.5,
  },

  subtitle: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 18,
    color: "#000000",
    fontSize: 18,
    marginBottom: 20,
  },

  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    overflow: "hidden",
  },

  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
  },

  loginText: {
    color: "#6B7280",
    fontSize: 15,
  },

  loginButton: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },

  sansgotText: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 16,
  },

  dateRow: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  dateSelect: {
    flex: 1,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  dateSelectYear: {
    flex: 1.2,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  dateSelectText: {
    color: "#000000",
    fontSize: 16,
  },

  ageText: {
    color: "#6B7280",
    fontSize: 16,
    marginBottom: 12,
  },

  errorText: {
    color: "#EF4444",
  },

  backButton: {
    marginTop: 20,
  },

  backText: {
    color: "#6B7280",
    fontSize: 16,
  },

  usernameBox: {
    width: "100%",
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingLeft: 18,
    marginBottom: 20,
  },

  usernameInput: {
    flex: 1,
    color: "#000000",
    fontSize: 18,
  },

  domain: {
    color: "#6B7280",
    fontSize: 15,
    marginRight: 16,
  },

  agreementText: {
    color: "#6B7280",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },

  checkboxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },

  checkboxChecked: {
    backgroundColor: "#00BFFF",
    borderColor: "#00BFFF",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  checkboxText: {
    flex: 1,
    color: "#6B7280",
    fontSize: 15,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 24,
    maxHeight: "65%",
  },

  modalTitle: {
    color: "#000000",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  optionsList: {
    marginBottom: 16,
  },

  option: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  optionText: {
    color: "#000000",
    fontSize: 16,
  },

  closeButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },

  closeText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },

  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#00BFFF",
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  checkmarkLarge: {
    color: "#00BFFF",
    fontSize: 28,
  },

  successTitle: {
    color: "#000000",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },

  successText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },

  usernamePreview: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
  },
});