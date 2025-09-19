import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { CardContainer } from "./common/CardContainer";
import { CurrencyDollar, TrendDown, TrendUp } from "phosphor-react-native";
import { formatMoney, Money } from "../utils/money";
import { FinanceSummary } from "../types";

export const FinanceCard: React.FC = () => {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      // TODO implement endpoint
      // const res = await fetch("https://tu.api/finance/summary", {
      //   signal: abortRef.current.signal,
      // });
      // if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // const json: FinanceSummary = await res.json();

      await new Promise((r) => setTimeout(r, 500));
      const json: FinanceSummary = {
        totalIncome: { value: 2500, currency: "USD" },
        totalExpenses: { value: 890, currency: "USD" },
        netWorth: { value: 1610, currency: "USD" },
        monthlyBudget: { value: 2000, currency: "USD" },
        spentThisMonth: { value: 890, currency: "USD" },
        remainingBudget: { value: 1110, currency: "USD" },
      };

      setData(json);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    return () => abortRef.current?.abort();
  }, [fetchSummary]);

  const balanceMoney = useMemo(() => {
    if (!data) return null;
    const balanceVal = data.totalIncome.value - data.totalExpenses.value;
    return {
      value: balanceVal,
      currency: data.totalIncome.currency,
      locale: data.totalIncome.locale,
    } satisfies Money;
  }, [data]);

  if (loading) {
    return (
      <CardContainer
        gradientColors={["#4CAF504D", "#4CAF5033"]}
        borderColor="#4CAF5014"
        cardTitle="Finance"
        onViewDetails={() => {}}
        icon={<CurrencyDollar size={20} weight="bold" />}
        iconColor="#4CAF50"
      >
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#7F8C8D", marginTop: 8 }}>Loading…</Text>
        </View>
      </CardContainer>
    );
  }

  if (error || !data || !balanceMoney) {
    return (
      <CardContainer
        gradientColors={["#4CAF504D", "#4CAF5033"]}
        borderColor="#4CAF5014"
        cardTitle="Finance"
        onViewDetails={() => {}}
        icon={<CurrencyDollar size={20} weight="bold" />}
        iconColor="#4CAF50"
      >
        <View style={{ paddingVertical: 12, alignItems: "center" }}>
          <Text style={{ color: "#F44336", marginBottom: 8 }}>{error || "No data available"}</Text>
          <TouchableOpacity onPress={fetchSummary} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </CardContainer>
    );
  }

  const isPositive = balanceMoney.value >= 0;

  return (
    <CardContainer
      gradientColors={["#4CAF504D", "#4CAF5033"]}
      borderColor="#4CAF5014"
      cardTitle="Finance"
      onViewDetails={() => {}}
      icon={<CurrencyDollar size={20} weight="bold" />}
      iconColor="#4CAF50"
    >
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceLabel}>Balance Total</Text>
        <Text style={[styles.balanceAmount, isPositive ? styles.positive : styles.negative]}>
          {formatMoney(balanceMoney)}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.incomeContainer}>
            <TrendUp size={16} color="#4CAF50" weight="bold" />
            <Text style={styles.statLabel}>Ingresos</Text>
          </View>
          <Text style={styles.incomeText}>{formatMoney(data.totalIncome)}</Text>
        </View>

        <View style={styles.statItem}>
          <View style={styles.expenseContainer}>
            <TrendDown size={16} color="#F44336" weight="bold" />
            <Text style={styles.statLabel}>Gastos</Text>
          </View>
          <Text style={styles.expenseText}>{formatMoney(data.totalExpenses)}</Text>
        </View>
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  balanceContainer: {
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "700",
  },
  positive: { color: "#4CAF50" },
  negative: { color: "#F44336" },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 16,
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
    marginLeft: 4,
  },
  incomeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  incomeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A233A",
  },
  expenseText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A233A",
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
  },
  retryText: {
    color: "#2E7D32",
    fontWeight: "600",
  },
});
