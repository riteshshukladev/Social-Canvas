import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  
  // scrollContainer: {
  //   flexGrow: 1,
  //   justifyContent: 'center',
  //   padding: 20,
  // },
  formContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
    color: '#666',
  },
  linkHighlight: {
    color: '#007AFF',
    fontWeight: '600',
  },

  oauthContainer: {
    marginBottom: 20,
    gap: 12,
  },
  
  // OAuth Buttons
  oauthButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  googleButton: {
    backgroundColor: '#ffffff',
    borderColor: '#dadce0',
  },
  
  githubButton: {
    backgroundColor: '#24292e',
    borderColor: '#24292e',
  },
  
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Override text color for dark buttons
  githubButton: {
    backgroundColor: '#24292e',
    borderColor: '#24292e',
  },
  
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  
  // Dark button text override
  darkButtonText: {
    color: '#ffffff',
  },

  separatorContainer: {
  flexDirection: "row",
  alignItems: "center",
  marginVertical: 20,
},
// The line on either side of the OR text
separatorLine: {
  flex: 1,
  height: 1,
  backgroundColor: "#E0E0E0", // A light gray
},
// The OR text itself
separatorText: {
  marginHorizontal: 10,
  color: "#888",
  fontWeight: "600",
},
// Container for the SSO buttons
ssoContainer: {
  width: '100%',
  gap: 15, // Creates space between the buttons
},
// Individual SSO button style
ssoButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 16,
  paddingHorizontal: 20,
  borderRadius: 8,
  borderWidth: 1,
  backgroundColor: 'transparent', // White background
  width: '100%',
},
// SSO button text style
ssoButtonText: {
  fontSize: 16,
  fontWeight: '400',
  letterSpacing: 0.4,
  color: 'white',
  },
loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
});


