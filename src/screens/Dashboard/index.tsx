import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "styled-components";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/auth";

import { HighlightCard } from "../../components/HighlightCard";
import { TransactionCard, TransactionCardProps } from "../../components/TransactionCard";

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LoadContainer,
} from "./styles";

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  expensives: HighlightProps;
  total: HighlightProps;
}

export interface DataListProps extends TransactionCardProps {
  id: string;
}

export function Dashboard() {
  const [isLoading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<DataListProps[]>([])
  const [highlightData, setHighlightData] = useState<HighlightData>({} as HighlightData)

  const theme = useTheme()

  const { user, signOut } = useAuth()

  function getLastTransactionDate(collection: DataListProps[], type: 'positive'|'negative') {
    const collectionFilttered = collection.filter(transaction => transaction.type === type)

    if (collectionFilttered.length === 0) return 0

    const lastTransaction = Math.max.apply(Math, collectionFilttered.map(transaction => new Date(transaction.date).getTime()))

    return Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'long',
    }).format(new Date(lastTransaction));
  }

  function getTotalIntervalTransactionDate(collection : DataListProps[]) {
    if (collection.length === 0) return 'Não há transações'

    const lastTransaction = new Date(Math.max.apply(Math, collection
    .map(transaction => new Date(transaction.date).getTime())));

    const lastTransactionFormmated = Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(lastTransaction);

    const firstTransaction = new Date(Math.min.apply(Math, collection
    .map(transaction => new Date(transaction.date).getTime())));

    const firstTransactionFormmated = Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(firstTransaction);

    const firstTransactionYear = firstTransaction.getFullYear();
    const lastTransactionYear = lastTransaction.getFullYear();

    return firstTransactionYear===lastTransactionYear 
      ? `${firstTransactionFormmated} ~ ${lastTransactionFormmated}`
      : `${firstTransactionFormmated}. ${firstTransactionYear} ~ ${lastTransactionFormmated}. ${lastTransactionYear}`;
  }

  async function loadTransactions(){
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let expensiveTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map((item: DataListProps) => {
      if (item.type == 'positive') {
        entriesTotal += Number(item.amount)
      } else {
        expensiveTotal += Number(item.amount)
      }
      const amount = Number(item.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

      const date = Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(new Date(item.date));

      return {
        ...item,
        amount,
        date
      }
    });

    setTransactions(transactionsFormatted)

    const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
    const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
    const totalInterval = getTotalIntervalTransactionDate(transactions)

    const total = entriesTotal - expensiveTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        lastTransaction: lastTransactionEntries === 0 ? 'Não há transações' : `Última entrada dia ${lastTransactionEntries}`
      },
      expensives: {
        amount: expensiveTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        lastTransaction: lastTransactionExpensives === 0 ? 'Não há transações' : `Última saída dia ${lastTransactionExpensives}`
      },
      total:  {
        amount: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        lastTransaction: totalInterval
      }
    })

    setLoading(false)
  }

  useEffect(()=>{
    loadTransactions();
  }, []);

  useFocusEffect(useCallback(() => {
    loadTransactions();
  }, []))

  return (
    <Container>
      { isLoading
        ? (
          <LoadContainer>
            <ActivityIndicator
              color={theme.colors.primary}
              size="large"
            />
          </LoadContainer>
        ) : (
          <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo source={{ uri: user.photo }} />
                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <TouchableOpacity onPress={signOut}>
                <Icon name="power" />
              </TouchableOpacity>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saidas"
              amount={highlightData.expensives.amount}
              lastTransaction={highlightData.expensives.lastTransaction}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
              
            />
          </Transactions>
          </>
        )
      }
    </Container>
  )
}
