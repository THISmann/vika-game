// Tests pour gameState.js
const gameState = require('../gameState');
const fs = require('fs');
const path = require('path');

describe('GameState', () => {
  beforeEach(() => {
    // Réinitialiser l'état avant chaque test
    gameState.resetGame();
  });

  test('should initialize with default state', () => {
    const state = gameState.getState();
    expect(state.isStarted).toBe(false);
    expect(state.currentQuestionIndex).toBe(-1);
    expect(state.connectedPlayers).toEqual([]);
  });

  test('should add connected player', () => {
    gameState.addConnectedPlayer('player1');
    expect(gameState.getConnectedPlayersCount()).toBe(1);
    
    gameState.addConnectedPlayer('player2');
    expect(gameState.getConnectedPlayersCount()).toBe(2);
  });

  test('should not add duplicate players', () => {
    gameState.addConnectedPlayer('player1');
    gameState.addConnectedPlayer('player1');
    expect(gameState.getConnectedPlayersCount()).toBe(1);
  });

  test('should remove connected player', () => {
    gameState.addConnectedPlayer('player1');
    gameState.addConnectedPlayer('player2');
    gameState.removeConnectedPlayer('player1');
    expect(gameState.getConnectedPlayersCount()).toBe(1);
  });

  test('should start game', () => {
    gameState.startGame();
    const state = gameState.getState();
    expect(state.isStarted).toBe(true);
    expect(state.currentQuestionIndex).toBe(0);
  });

  test('should set current question', () => {
    gameState.setCurrentQuestion('q1', 30000);
    const state = gameState.getState();
    expect(state.currentQuestionId).toBe('q1');
    expect(state.questionDuration).toBe(30000);
    expect(state.questionStartTime).toBeTruthy();
  });

  test('should move to next question', () => {
    gameState.startGame();
    gameState.setCurrentQuestion('q1', 30000);
    gameState.nextQuestion();
    const state = gameState.getState();
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.currentQuestionId).toBe(null);
  });

  test('should save answer', () => {
    gameState.saveAnswer('player1', 'q1', 'answer1');
    const state = gameState.getState();
    expect(state.answers['player1']['q1']).toBe('answer1');
  });

  test('should save question result', () => {
    gameState.saveQuestionResult('q1', 'correct', [
      { playerId: 'player1', answer: 'correct', isCorrect: true }
    ]);
    const state = gameState.getState();
    expect(state.results['q1'].correctAnswer).toBe('correct');
    expect(state.results['q1'].playerResults).toHaveLength(1);
  });

  test('should end game', () => {
    gameState.startGame();
    gameState.endGame();
    const state = gameState.getState();
    expect(state.isStarted).toBe(false);
    expect(state.currentQuestionIndex).toBe(-1);
  });

  test('should reset game', () => {
    gameState.startGame();
    gameState.addConnectedPlayer('player1');
    gameState.saveAnswer('player1', 'q1', 'answer1');
    
    gameState.resetGame();
    const state = gameState.getState();
    expect(state.isStarted).toBe(false);
    expect(state.connectedPlayers).toEqual([]);
    expect(Object.keys(state.answers)).toHaveLength(0);
  });
});











