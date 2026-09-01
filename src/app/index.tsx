import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  ScrollView,
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

  const [picker, setPicker] = useState<
    "day" | "month" | "year" | null
  >(null);

  const [username, setUsername] = useState("");
  const [sassword, setSassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // =========================
  // SIGN IN
  // =========================

  const [loginUsername, setLoginUsername] = useState("");
  const [loginSassword, setLoginSassword] = useState("");

  // =========================
  // AGE
  // =========================

  const calculateAge = () => {
    if (day === null || month === null || year === null) {
      return null;
    }

    const today = new Date();

    let calculatedAge =
      today.getFullYear() - year;

    const currentMonth = today.getMonth() + 1;

    if (
      currentMonth < month ||
      (currentMonth === month &&
        today.getDate() < day)
    ) {
      calculatedAge--;
    }

    return calculatedAge;
  };

  const age = calculateAge();

  const isOldEnough =
    age !== null && age >= 7;

  // ==================================================
  // PAGE 1 — NAME
  // ==================================================

  if (page === 1) {
    return (
      <View style={styles.container}>

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          What's your name?
        </Text>

        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#777"
          value={firstName}
          onChangeText={setFirstName}
        />

        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#777"
          value={lastName}
          onChangeText={setLastName}
        />

        <Pressable
          style={styles.button}
          onPress={() => setPage(2)}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </Pressable>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already Have a SansCount?
          </Text>

          <Pressable
            onPress={() => setPage(7)}
          >
            <Text style={styles.loginButton}>
              Sign In
            </Text>
          </Pressable>
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

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          Birthdate
        </Text>

        <Text style={styles.subtitle}>
          You must be at least 13 years old.
        </Text>

        <View style={styles.dateRow}>

          <Pressable
            style={styles.dateSelect}
            onPress={() => setPicker("day")}
          >
            <Text style={styles.dateSelectText}>
              {day ?? "Day"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.dateSelect}
            onPress={() => setPicker("month")}
          >
            <Text style={styles.dateSelectText}>
              {month ?? "Month"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.dateSelectYear}
            onPress={() => setPicker("year")}
          >
            <Text style={styles.dateSelectText}>
              {year ?? "Year"}
            </Text>
          </Pressable>

        </View>

        {age !== null && (
          <Text
            style={[
              styles.ageText,
              !isOldEnough && styles.errorText,
            ]}
          >
            Age: {age}
            {!isOldEnough && " — Must be 13+"}
          </Text>
        )}

        <Pressable
          style={[
            styles.button,
            !isOldEnough && styles.disabledButton,
          ]}
          disabled={!isOldEnough}
          onPress={() => setPage(3)}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => setPage(1)}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

        {/* DATE PICKER */}

        <Modal
          visible={picker !== null}
          transparent
          animationType="slide"
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
                  Array.from(
                    { length: 31 },
                    (_, i) => i + 1
                  ).map((item) => (
                    <Pressable
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setDay(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}

                {picker === "month" &&
                  Array.from(
                    { length: 12 },
                    (_, i) => i + 1
                  ).map((item) => (
                    <Pressable
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setMonth(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}

                {picker === "year" &&
                  Array.from(
                    { length: 100 },
                    (_, i) =>
                      new Date().getFullYear() - i
                  ).map((item) => (
                    <Pressable
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setYear(item);
                        setPicker(null);
                      }}
                    >
                      <Text style={styles.optionText}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}

              </ScrollView>

              <Pressable
                style={styles.closeButton}
                onPress={() => setPicker(null)}
              >
                <Text style={styles.closeText}>
                  Cancel
                </Text>
              </Pressable>

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

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          Create your username
        </Text>

        <View style={styles.usernameBox}>

          <TextInput
            style={styles.usernameInput}
            placeholder="Username"
            placeholderTextColor="#777"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text style={styles.domain}>
            @sanscounts.san
          </Text>

        </View>

        <Pressable
          style={styles.button}
          onPress={() => setPage(4)}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => setPage(2)}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

      </View>
    );
  }

  // ==================================================
  // PAGE 4 — SASSWORD
  // ==================================================

  if (page === 4) {
    return (
      <View style={styles.container}>

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          Create your Sassword
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Sassword"
          placeholderTextColor="#777"
          value={sassword}
          onChangeText={setSassword}
          secureTextEntry
        />

        <Pressable
          style={styles.button}
          onPress={() => setPage(5)}
        >
          <Text style={styles.buttonText}>
            Continue
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => setPage(3)}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

      </View>
    );
  }

  // ==================================================
  // PAGE 5 — AGREEMENT
  // ==================================================

  if (page === 5) {
    return (
      <View style={styles.container}>

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          Agreement
        </Text>

        <Text style={styles.agreementText}>
          Please review and agree to the
          SansCounts Terms & Conditions
          before creating your account.
        </Text>

        <Pressable
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
        >

          <View
            style={[
              styles.checkbox,
              agreed && styles.checkboxChecked,
            ]}
          >
            {agreed && (
              <Text style={styles.checkmark}>
                ✓
              </Text>
            )}
          </View>

          <Text style={styles.checkboxText}>
            I agree to the SansCounts Terms &
            Conditions
          </Text>

        </Pressable>

        <Pressable
          style={[
            styles.button,
            !agreed && styles.disabledButton,
          ]}
          disabled={!agreed}
          onPress={() => setPage(6)}
        >
          <Text style={styles.buttonText}>
            Create Account
          </Text>
        </Pressable>

        <Pressable
          style={styles.backButton}
          onPress={() => setPage(4)}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

      </View>
    );
  }

  // ==================================================
  // PAGE 6 — SUCCESS
  // ==================================================

  if (page === 6) {
    return (
      <View style={styles.container}>

        <View style={styles.successCircle}>
          <Text style={styles.checkmarkLarge}>
            ✓
          </Text>
        </View>

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.successTitle}>
          Success!
        </Text>

        <Text style={styles.successText}>
          Your SansCounts account has been
          created successfully.
        </Text>

        <Text style={styles.usernamePreview}>
          {username}@sanscounts.san
        </Text>

        <Pressable
          style={styles.button}
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
        >
          <Text style={styles.buttonText}>
            Done
          </Text>
        </Pressable>

      </View>
    );
  }

  // ==================================================
  // PAGE 7 — SIGN IN
  // ==================================================

  if (page === 7) {
    return (
      <View style={styles.container}>

        <Text style={styles.logo}>
          SansCounts
        </Text>

        <Text style={styles.title}>
          Welcome Back
        </Text>

        {/* USERNAME */}

        <Text style={styles.fieldLabel}>
          Username :
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#777"
          value={loginUsername}
          onChangeText={setLoginUsername}
          autoCapitalize="none"
        />

        {/* SANSWORD */}

        <Text style={styles.fieldLabel}>
          Sansword :
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Sansword"
          placeholderTextColor="#777"
          value={loginSassword}
          onChangeText={setLoginSassword}
          secureTextEntry
        />

        {/* SANS GOT SASSWORD */}

        <Pressable
          onPress={() => {
            // Future: Sansword recovery system
          }}
        >
          <Text style={styles.sansgotText}>
            Sansnot Sassword?
          </Text>
        </Pressable>

        {/* SIGN IN */}

        <Pressable
          style={styles.button}
          onPress={() => setPage(8)}
        >
          <Text style={styles.buttonText}>
            Sign In
          </Text>
        </Pressable>

        {/* SIGN UP */}

        <View style={styles.loginContainer}>

          <Text style={styles.loginText}>
            Don't Have a SansCount?
          </Text>

          <Pressable
            onPress={() => setPage(1)}
          >
            <Text style={styles.loginButton}>
              Sign Up
            </Text>
          </Pressable>

        </View>

      </View>
    );
  }

  // ==================================================
  // PAGE 8 — SIGN IN SUCCESS
  // ==================================================

  return (
    <View style={styles.container}>

      <View style={styles.successCircle}>
        <Text style={styles.checkmarkLarge}>
          ✓
        </Text>
      </View>

      <Text style={styles.logo}>
        SansCounts
      </Text>

      <Text style={styles.successTitle}>
        Welcome!
      </Text>

      <Text style={styles.successText}>
        You have successfully signed in.
      </Text>

      <Text style={styles.usernamePreview}>
        {loginUsername}
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => {
          setPage(7);
          setLoginUsername("");
          setLoginSassword("");
        }}
      >
        <Text style={styles.buttonText}>
          Sign Out
        </Text>
      </Pressable>

    </View>
  );
}

// ==================================================
// STYLES
// ==================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 48,
    fontWeight: "700",
    marginBottom: 40,
    letterSpacing: -2,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 25,
  },

  subtitle: {
    color: "#999999",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
  },

  fieldLabel: {
    width: "100%",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 58,
    backgroundColor: "#111111",
    borderRadius: 14,
    paddingHorizontal: 18,
    color: "#FFFFFF",
    fontSize: 18,
    marginBottom: 18,
  },

  button: {
    width: "80%",
    height: 55,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },

  disabledButton: {
    opacity: 0.35,
  },

  buttonText: {
    color: "#000000",
    fontSize: 17,
    fontWeight: "700",
  },

  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  loginText: {
    color: "#999999",
    fontSize: 15,
  },

  loginButton: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 5,
  },

  sansgotText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginTop: -5,
    marginBottom: 5,
  },

  dateRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  dateSelect: {
    flex: 1,
    height: 58,
    backgroundColor: "#111111",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  dateSelectYear: {
    flex: 1.3,
    height: 58,
    backgroundColor: "#111111",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  dateSelectText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  ageText: {
    color: "#FFFFFF",
    fontSize: 17,
    marginBottom: 5,
  },

  errorText: {
    color: "#FF5555",
  },

  backButton: {
    marginTop: 25,
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 16,
  },

  usernameBox: {
    width: "100%",
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111111",
    borderRadius: 14,
    paddingLeft: 18,
    marginBottom: 25,
  },

  usernameInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 18,
  },

  domain: {
    color: "#FFFFFF",
    fontSize: 15,
    marginRight: 15,
  },

  agreementText: {
    color: "#AAAAAA",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 30,
  },

  checkboxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: "#FFFFFF",
  },

  checkmark: {
    color: "#000000",
    fontSize: 18,
    fontWeight: "700",
  },

  checkboxText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 20,
  },

  // MODAL

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },

  modalBox: {
    backgroundColor: "#111111",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    maxHeight: "70%",
  },

  modalTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 15,
  },

  optionsList: {
    marginBottom: 10,
  },

  option: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },

  optionText: {
    color: "#FFFFFF",
    fontSize: 18,
  },

  closeButton: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
  },

  closeText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },

  // SUCCESS

  successCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  checkmarkLarge: {
    color: "#2196F3",
    fontSize: 40,
    fontWeight: "600",
  },

  successTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 15,
  },

  successText: {
    color: "#AAAAAA",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },

  usernamePreview: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 15,
  },
});