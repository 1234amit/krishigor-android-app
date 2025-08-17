import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PrivacyPolicyScreen = ({ navigation, route }) => {
  const { userId, phoneNumber, userData, token } = route.params || {};

  const privacySections = [
    {
      title: "Information We Collect",
      content: [
        "Personal Information: Name, email address, phone number, and address when you create an account or place orders.",
        "Payment Information: Credit card details, billing address, and transaction history (securely processed through our payment partners).",
        "Usage Data: Information about how you use our app, including products viewed, search queries, and interaction patterns.",
        "Device Information: Device type, operating system, and unique device identifiers for app functionality and security."
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "Account Management: To create and manage your account, process orders, and provide customer support.",
        "Service Delivery: To fulfill orders, process payments, and deliver products to your specified address.",
        "Communication: To send order confirmations, delivery updates, and respond to your inquiries.",
        "Improvement: To analyze usage patterns and improve our app, products, and services.",
        "Security: To protect against fraud, unauthorized access, and ensure the security of our platform."
      ]
    },
    {
      title: "Information Sharing",
      content: [
        "We do not sell, trade, or rent your personal information to third parties.",
        "Service Providers: We may share information with trusted partners who assist in operating our platform (payment processors, delivery services).",
        "Legal Requirements: We may disclose information when required by law or to protect our rights and safety.",
        "Business Transfers: In case of merger, acquisition, or sale of assets, user information may be transferred as part of the business."
      ]
    },
    {
      title: "Data Security",
      content: [
        "We implement industry-standard security measures to protect your personal information.",
        "All data transmission is encrypted using SSL/TLS protocols.",
        "Access to personal information is restricted to authorized personnel only.",
        "Regular security audits and updates are conducted to maintain data protection standards."
      ]
    },
    {
      title: "Your Rights",
      content: [
        "Access: You can request access to the personal information we hold about you.",
        "Correction: You can update or correct your personal information through your account settings.",
        "Deletion: You can request deletion of your account and associated data (subject to legal requirements).",
        "Opt-out: You can opt-out of marketing communications and certain data collection practices.",
        "Portability: You can request a copy of your data in a portable format."
      ]
    },
    {
      title: "Data Retention",
      content: [
        "We retain your personal information for as long as necessary to provide our services.",
        "Account data is retained while your account is active and for a reasonable period after deactivation.",
        "Order and transaction data is retained for legal and accounting purposes.",
        "You can request deletion of your data at any time through your account settings."
      ]
    },
    {
      title: "Cookies and Tracking",
      content: [
        "We use cookies and similar technologies to enhance your app experience.",
        "Essential cookies are necessary for basic app functionality and cannot be disabled.",
        "Analytics cookies help us understand how users interact with our platform.",
        "You can manage cookie preferences through your device settings."
      ]
    },
    {
      title: "Children's Privacy",
      content: [
        "Our services are not intended for children under 13 years of age.",
        "We do not knowingly collect personal information from children under 13.",
        "If we become aware of such collection, we will take steps to delete the information promptly.",
        "Parents or guardians should contact us if they believe their child has provided personal information."
      ]
    },
    {
      title: "International Transfers",
      content: [
        "Your information may be transferred to and processed in countries other than your own.",
        "We ensure that such transfers comply with applicable data protection laws.",
        "We implement appropriate safeguards to protect your information during international transfers.",
        "By using our services, you consent to such transfers."
      ]
    },
    {
      title: "Changes to This Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices.",
        "Significant changes will be communicated through the app or email notifications.",
        "Continued use of our services after changes constitutes acceptance of the updated policy.",
        "We encourage you to review this policy periodically for any updates."
      ]
    },
    {
      title: "Contact Us",
      content: [
        "If you have questions about this Privacy Policy or our data practices, please contact us:",
        "Email: privacy@krishigor.com",
        "Phone: +880-XXX-XXX-XXXX",
        "Address: [Your Company Address]",
        "We will respond to your inquiries within 30 days."
      ]
    }
  ];

  const renderSection = (section, index) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.content.map((item, itemIndex) => (
        <View key={itemIndex} style={styles.bulletPoint}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Last Updated Banner */}
      <View style={styles.lastUpdatedBanner}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.lastUpdatedText}>Last Updated: December 15, 2024</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introText}>
            At KrishiGor, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, share, and protect your information when you use our mobile application and services.
          </Text>
          <Text style={styles.introText}>
            By using our services, you agree to the collection and use of information in accordance with this policy. We are committed to transparency and will always inform you about how your data is handled.
          </Text>
        </View>

        {/* Privacy Sections */}
        {privacySections.map(renderSection)}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Thank You for Trusting KrishiGor</Text>
          <Text style={styles.footerText}>
            We value your trust and are committed to protecting your privacy. If you have any questions or concerns about this Privacy Policy, please don't hesitate to contact us.
          </Text>
          <View style={styles.footerActions}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={() => {
                // You can add navigation to contact support here
                Alert.alert('Contact Support', 'Please email us at support@krishigor.com');
              }}
            >
              <Ionicons name="mail-outline" size={20} color="#4CAF50" />
              <Text style={styles.contactButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 34,
  },
  lastUpdatedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff3cd',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffeaa7',
  },
  lastUpdatedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 20,
  },
  introSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  introText: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e8f5e8',
    paddingBottom: 8,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
  bulletText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    flex: 1,
    textAlign: 'justify',
  },
  footer: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 25,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  contactButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PrivacyPolicyScreen;
