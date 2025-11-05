import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 12 },
    h1: { fontSize: 18, marginBottom: 8, fontWeight: 700 },
    section: { marginBottom: 12 },
    label: { fontWeight: 700 },
    small: { fontSize: 10, color: "#555" }
});

export default function EntentePdfDoc({ entente }) {
    const etu = entente?.etudiant || {};
    const stage = entente?.stage || {};
    const emp = entente?.employeur || stage?.employeur || {};

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.section}>
                    <Text style={styles.h1}>Entente de stage</Text>
                    <Text style={styles.small}>
                        Statut: {entente?.status ?? "N/A"} • Créée le: {entente?.dateCreation ?? "—"}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Étudiant</Text>
                    <Text>{[etu?.firstName, etu?.lastName].filter(Boolean).join(" ")}</Text>
                    <Text>{etu?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Employeur</Text>
                    <Text>{emp?.nomEntreprise || emp?.companyName || emp?.name}</Text>
                    <Text>{emp?.email}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Stage</Text>
                    <Text>{stage?.titre || stage?.title}</Text>
                    <Text>{stage?.description}</Text>
                    <Text>Lieu: {stage?.lieu || stage?.location || "—"}</Text>
                    <Text>Rémunération: {stage?.remuneration ?? stage?.compensation ?? "—"}</Text>
                    <Text>Durée: {stage?.duree ?? "—"}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>Signatures</Text>
                    <Text>Étudiant: __________________  Date: __________</Text>
                    <Text>Employeur: ________________  Date: __________</Text>
                </View>
            </Page>
        </Document>
    );
}
