import fetchMock from 'jest-fetch-mock'
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock'
import { renderHook, act } from '@testing-library/react-hooks'
import { mocked } from 'ts-jest/utils'
import { AuthProvider, useAuth } from './auth'
import { startAsync } from 'expo-auth-session'

fetchMock.enableMocks()

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage)
jest.mock('expo-auth-session')

describe('Auth Hook', () => {
  beforeEach(async () => {
    mockAsyncStorage.clear()
  })

  it('should be able to sign in with Google account existing',  async() => {
    const googleMocked = mocked(startAsync as any)
    googleMocked.mockReturnValueOnce({
      type: 'success',
      params: {
        access_token: 'any_token'
      }
    })

    fetchMock.mockResponseOnce(
      JSON.stringify({
        id: 'any_id',
        email: 'phaelslima@gmail.com',
        name: 'Raphael',
        photo: 'any_photo.png'
      })
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    await act(async () => await result.current.signInWithGoogle())

    expect(result.current.user.email).toBe('phaelslima@gmail.com')
  })

  it('user should not connect if cancel authentication with Google', async () => {
    const googleMocked = mocked(startAsync as any)
    googleMocked.mockReturnValueOnce({
      type: 'cancel'
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    await act(async () => await result.current.signInWithGoogle())

    expect(result.current.user).not.toHaveProperty('id')
  })

  it('should be error with incorrectly Google parameters', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    })

    try {
      await act(async () => await result.current.signInWithGoogle())
    } catch (error) {
      expect(result.current.user).toEqual({})  
    }
  })

})

