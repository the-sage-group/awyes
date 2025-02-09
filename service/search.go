package service

import (
	"context"
	"strings"
	"sync"

	"github.com/go-pg/pg/v10"
	"github.com/the-sage-group/awyes/proto"
)

// Search implements the Search RPC method
func (s *Service) Search(ctx context.Context, req *proto.SearchRequest) (*proto.SearchResponse, error) {
	query := strings.ToLower(req.GetQuery())
	resp := &proto.SearchResponse{}
	var wg sync.WaitGroup
	var mu sync.Mutex
	var searchErr error

	// Search routes
	wg.Add(1)
	go func() {
		defer wg.Done()
		var routes []*proto.Route
		q := s.db.Model(&routes)
		if query != "" {
			q = q.Where("LOWER(name) LIKE ?", "%"+query+"%").
				WhereOr("LOWER(display_name) LIKE ?", "%"+query+"%").
				WhereOr("LOWER(description) LIKE ?", "%"+query+"%")
		}
		err := q.Select()
		if err != nil && err != pg.ErrNoRows {
			mu.Lock()
			searchErr = err
			mu.Unlock()
			return
		}
		mu.Lock()
		resp.Routes = routes
		mu.Unlock()
	}()

	// Search entities
	wg.Add(1)
	go func() {
		defer wg.Done()
		var entities []*proto.Entity
		q := s.db.Model(&entities)
		if query != "" {
			q = q.Where("LOWER(name) LIKE ?", "%"+query+"%")
		}
		err := q.Select()
		if err != nil && err != pg.ErrNoRows {
			mu.Lock()
			searchErr = err
			mu.Unlock()
			return
		}
		mu.Lock()
		resp.Entities = entities
		mu.Unlock()
	}()

	// Search handlers
	wg.Add(1)
	go func() {
		defer wg.Done()
		var handlers []*proto.Handler
		q := s.db.Model(&handlers)
		if query != "" {
			q = q.Where("LOWER(name) LIKE ?", "%"+query+"%").
				WhereOr("LOWER(description) LIKE ?", "%"+query+"%")
		}
		err := q.Select()
		if err != nil && err != pg.ErrNoRows {
			mu.Lock()
			searchErr = err
			mu.Unlock()
			return
		}
		mu.Lock()
		resp.Handlers = handlers
		mu.Unlock()
	}()

	wg.Wait()
	if searchErr != nil {
		return nil, searchErr
	}

	return resp, nil
}
