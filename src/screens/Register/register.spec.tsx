import React from 'react'
import fetchMock from 'jest-fetch-mock'
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import { Register } from './index'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { ThemeProvider } from 'styled-components/native'
import theme from '../../global/styles/theme'

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)

jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

const Providers: React.FC = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
)

describe('Register Screen', () => {
  it('should be open category modal when user click on the category button', async () => {
    const { getByTestId } = render(
      <Register />,
      {
        wrapper: Providers
      }
    )

    const categoryModal = getByTestId('modal-category')
    const buttonCategory = getByTestId('button-category')
    fireEvent.press(buttonCategory)

    await waitFor(() => {
      expect(categoryModal.props.visible).toBeTruthy();
    })
  })
})