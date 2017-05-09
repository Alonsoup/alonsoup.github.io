frontend-nanodegree-arcade-game
===============================

This game is the final project of the Object Oriented JavaScript Course on Udacity. The functionality I added is explained below.

Controls- To move the player arround, use the arrow keys in your keyboard. Holding the key won't make the character keep moving. You have to tap continuously.

Bugs- The player should avoid contact with the crossing bugs. Touching a bug will decrease the player's lifes by one.

Gems- The objective of the game is to gain points and the way to do that is by collecting gems:
  Green gems are worth one point.
  Blue gems are worth five points.
  Orange gems are worth ten points.

Fish Statue- In order to make gems appear, the player must talk (get close) to the fish statue on the top left corner. After talking to the statue, the player must collect all gems before he can talk to it again and trigger the next batch.

Power-Ups- There are two power-ups in the game. Hearts increase the player's lifes by one and stars increase the amount and value of gems in the next batch. Power-ups pop up on the road after completing three trips to the water.
  

One of the main features I added is the ranking system. I used Firebase Authentication (with Google as a provider) and its Realtime DataBase. Users can submit their score and they will be instantly added to the ranking. 
Users can only submit scores that are higher than their current highest score.
